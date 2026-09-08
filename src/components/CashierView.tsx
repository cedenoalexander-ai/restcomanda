import { useState, useMemo } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle2,
  Printer,
  Receipt,
  Users,
  AlertCircle,
  X,
  Clock,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { Order, Table, RestaurantSettings } from '../types';
import { payOrder, cancelOrder } from '../utils/api';
import { formatBs, formatDual, formatUSD } from '../utils/currency';

interface CashierViewProps {
  tables: Table[];
  orders: Order[];
  settings: RestaurantSettings;
  onRefresh: () => void;
  onPrintReceipt: (order: Order) => void;
}

export default function CashierView({
  tables,
  orders,
  settings,
  onRefresh,
  onPrintReceipt,
}: CashierViewProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia' | 'pago_movil'>('efectivo');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [tipPercent, setTipPercent] = useState<number>(settings.defaultTipPercent || 10);
  const [cashGiven, setCashGiven] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Active open orders (not paid and not canceled)
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'pagada' && o.status !== 'cancelada');
  }, [orders]);

  const selectedTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId);
  }, [tables, selectedTableId]);

  const currentOrder = useMemo(() => {
    if (!selectedTableId) return null;
    return activeOrders.find((o) => o.tableId === selectedTableId);
  }, [activeOrders, selectedTableId]);

  // Totals calculations with tip
  const calculatedTotals = useMemo(() => {
    if (!currentOrder) return { subtotal: 0, tax: 0, tip: 0, total: 0 };
    const subtotal = currentOrder.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const tax = Number(((subtotal * settings.taxPercent) / 100).toFixed(2));
    const tip = Number(((subtotal * tipPercent) / 100).toFixed(2));
    const total = Number((subtotal + tax + tip).toFixed(2));
    return { subtotal, tax, tip, total };
  }, [currentOrder, settings.taxPercent, tipPercent]);

  // Cash change calculation
  const cashChange = useMemo(() => {
    const given = parseFloat(cashGiven) || 0;
    const diff = given - calculatedTotals.total;
    return diff > 0 ? diff : 0;
  }, [cashGiven, calculatedTotals.total]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSelectTable = (tableId: string) => {
    setSelectedTableId(tableId);
    setCashGiven('');
    setPaymentReference('');
  };

  const handleProcessPayment = async () => {
    if (!currentOrder) return;

    setIsProcessing(true);
    try {
      const res = await payOrder(currentOrder.id, {
        paymentMethod,
        paymentReference,
        tipPercent,
        tipAmount: calculatedTotals.tip,
      });

      showNotification(`¡Mesa ${currentOrder.tableName} pagada y liberada exitosamente!`);
      onRefresh();

      // Offer to print receipt
      if (res.order) {
        onPrintReceipt(res.order);
      }
      setSelectedTableId(null);
    } catch (err: any) {
      showNotification(err.message || 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    const confirmCancel = window.confirm(
      `¿Está seguro de cancelar el pedido #${currentOrder.orderNumber} de la ${currentOrder.tableName}?`
    );
    if (!confirmCancel) return;

    try {
      await cancelOrder(currentOrder.id);
      showNotification(`Pedido cancelado y ${currentOrder.tableName} liberada.`);
      onRefresh();
      setSelectedTableId(null);
    } catch (err: any) {
      showNotification(err.message || 'Error al cancelar');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-100 text-neutral-900 p-4 md:p-6 pb-20">
      {/* Toast */}
      {notification && (
        <div className="fixed top-18 right-4 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full space-y-5">
        {/* Cashier Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div>
            <h2 className="text-lg md:text-xl font-black text-neutral-900">
              Caja & Cierre de Cuentas
            </h2>
            <p className="text-xs text-neutral-500">
              Gestión de cobro, impresión de facturas y liberación de mesas para nuevos clientes.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
              {activeOrders.length} {activeOrders.length === 1 ? 'Mesa Ocupada' : 'Mesas Ocupadas'}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-semibold">
              {activeOrders.filter((o) => o.status === 'cuenta_solicitada').length} Esperando Pago
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Mesas List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Seleccionar Mesa a Cobrar
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {tables.map((table) => {
                const order = activeOrders.find((o) => o.tableId === table.id);
                const isSelected = selectedTableId === table.id;
                const isBillRequested = order?.status === 'cuenta_solicitada';

                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all shadow-xs flex flex-col justify-between min-h-[96px] ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white ring-2 ring-neutral-900'
                        : isBillRequested
                        ? 'border-rose-400 bg-rose-50/80 hover:bg-rose-100'
                        : order
                        ? 'border-amber-300 bg-amber-50/60 hover:bg-amber-100'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold text-sm ${
                            isSelected ? 'text-white' : 'text-neutral-900'
                          }`}
                        >
                          {table.name}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected
                              ? 'bg-amber-400'
                              : isBillRequested
                              ? 'bg-rose-500 animate-pulse'
                              : order
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          isSelected ? 'text-neutral-300' : 'text-neutral-500'
                        }`}
                      >
                        {table.capacity} pers.
                      </span>
                    </div>

                    <div className="pt-2 border-t border-neutral-200/40 mt-1 flex items-center justify-between text-xs">
                      {order ? (
                        <>
                          <span
                            className={
                              isSelected ? 'text-neutral-300' : 'text-neutral-600'
                            }
                          >
                            #{order.orderNumber}
                          </span>
                          <span
                            className={`font-bold ${
                              isSelected ? 'text-white' : 'text-neutral-900'
                            }`}
                          >
                            {settings.currencySymbol}
                            {order.total.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span
                          className={
                            isSelected ? 'text-neutral-300' : 'text-emerald-700 font-medium'
                          }
                        >
                          Libre
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Checkout & Settlement Panel */}
          <div className="lg:col-span-7">
            {selectedTable && currentOrder ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-5">
                {/* Table details bar */}
                <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-neutral-900">
                        {selectedTable.name} • Pedido #{currentOrder.orderNumber}
                      </h3>
                      {currentOrder.status === 'cuenta_solicitada' && (
                        <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          Cuenta Solicitada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Mesonero: <strong>{currentOrder.waiterName}</strong> •{' '}
                      {currentOrder.customerCount} comensales • Apertura:{' '}
                      {new Date(currentOrder.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPrintReceipt(currentOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 transition-colors"
                    title="Imprimir pre-cuenta para entregar al cliente"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Pre-cuenta</span>
                  </button>
                </div>

                {/* Items consumed breakdown by rounds */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Detalle del Consumo ({currentOrder.items.length} productos)
                  </h4>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {currentOrder.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-neutral-50 border border-neutral-200/60"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-800 bg-neutral-200 px-1.5 py-0.2 rounded-xs">
                            {it.quantity}x
                          </span>
                          <span className="font-medium text-neutral-900">{it.name}</span>
                          {it.round > 1 && (
                            <span className="text-[10px] text-amber-700 bg-amber-100 px-1 py-0.2 rounded-xs font-semibold">
                              Adicional R{it.round}
                            </span>
                          )}
                          {it.notes && (
                            <span className="text-[10px] text-neutral-500 italic">
                              ({it.notes})
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-neutral-900">
                          {settings.currencySymbol}
                          {(it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tip Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Propina del Servicio:
                    </label>
                    <span className="text-xs font-bold text-neutral-700">
                      {settings.currencySymbol}
                      {calculatedTotals.tip.toFixed(2)} ({tipPercent}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTipPercent(pct)}
                        className={`py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                          tipPercent === pct
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        {pct === 0 ? 'Sin Propina' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal / Tax / Total Box */}
                <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      {settings.currencySymbol}
                      {calculatedTotals.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>IVA / Impuestos ({settings.taxPercent}%):</span>
                    <span className="font-semibold">
                      {settings.currencySymbol}
                      {calculatedTotals.tax.toFixed(2)}
                    </span>
                  </div>
                  {calculatedTotals.tip > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Propina voluntaria ({tipPercent}%):</span>
                      <span className="font-semibold">
                        {settings.currencySymbol}
                        {calculatedTotals.tip.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-neutral-200 text-neutral-900">
                    <div>
                      <span className="font-bold text-sm block">TOTAL A COBRAR:</span>
                      <span className="text-[11px] font-bold text-neutral-500">
                        Tasa BCV: {formatBs(1, settings.bcvRate)} / $
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-xl text-neutral-900 block">
                        {settings.currencySymbol}
                        {calculatedTotals.total.toFixed(2)}
                      </span>
                      <span className="font-black text-base text-emerald-800 block">
                        {formatBs(calculatedTotals.total, settings.bcvRate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Forma de Pago del Cliente:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                        paymentMethod === 'efectivo'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Efectivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tarjeta')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                        paymentMethod === 'tarjeta'
                          ? 'border-neutral-900 bg-neutral-100 text-neutral-900 ring-1 ring-neutral-900'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-neutral-800" />
                      <span>Punto / Tarjeta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pago_movil')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                        paymentMethod === 'pago_movil'
                          ? 'border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>Pago Móvil</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transferencia')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                        paymentMethod === 'transferencia'
                          ? 'border-purple-600 bg-purple-50 text-purple-950 ring-1 ring-purple-600'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <Building className="w-4 h-4 text-purple-600" />
                      <span>Transferencia</span>
                    </button>
                  </div>
                </div>

                {/* Pago Movil or Transfer Notice */}
                {(paymentMethod === 'pago_movil' || paymentMethod === 'transferencia') && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-xs text-blue-950">
                    <div className="flex items-center justify-between font-bold">
                      <span>Monto exacto a transferir en Bolívares (Bs.):</span>
                      <span className="text-sm font-black text-blue-900">
                        {formatBs(calculatedTotals.total, settings.bcvRate)}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700">
                      Calculado según tasa oficial BCV ({formatBs(1, settings.bcvRate)} por cada dólar).
                    </p>
                  </div>
                )}

                {/* Cash Change Calculator */}
                {paymentMethod === 'efectivo' && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-900">
                        Calculadora de Vuelto / Cambio (USD):
                      </span>
                      <span className="text-emerald-700 font-medium">
                        Total: {settings.currencySymbol}
                        {calculatedTotals.total.toFixed(2)} ({formatBs(calculatedTotals.total, settings.bcvRate)})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="text-[11px] text-emerald-800 block mb-0.5">
                          Monto Recibido en Dólares ($):
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                            {settings.currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.5"
                            value={cashGiven}
                            onChange={(e) => setCashGiven(e.target.value)}
                            placeholder={calculatedTotals.total.toFixed(2)}
                            className="w-full pl-6 pr-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-neutral-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-emerald-200 text-center">
                        <span className="text-[11px] text-neutral-500 block">Vuelto a Entregar:</span>
                        <span className="text-base font-black text-emerald-700 block">
                          {settings.currencySymbol}
                          {cashChange.toFixed(2)}
                        </span>
                        {cashChange > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold block">
                            ≈ {formatBs(cashChange, settings.bcvRate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reference number for non-cash */}
                {paymentMethod !== 'efectivo' && (
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">
                      Nº de Referencia / Aprobación (Opcional):
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Ej: 948271 o Lote 45"
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                )}

                {/* Final Close & Pay Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcessPayment}
                    className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {isProcessing
                        ? 'Procesando pago...'
                        : `Cobrar ${settings.currencySymbol}${calculatedTotals.total.toFixed(2)} y Liberar Mesa`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    className="px-3 py-3 text-xs text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Cancelar pedido por error"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center space-y-3">
                <Receipt className="w-12 h-12 text-neutral-300 mx-auto" />
                <h4 className="font-bold text-neutral-700">Selecciona una mesa ocupada</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Haz clic en cualquier mesa con comanda activa a la izquierda para revisar su cuenta total, aplicar propina, registrar el pago y liberar la mesa.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
