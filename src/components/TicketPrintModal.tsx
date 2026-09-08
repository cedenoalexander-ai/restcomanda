import { useState } from 'react';
import { Printer, X, Check, ChefHat, Receipt } from 'lucide-react';
import { KitchenTicketBatch, Order, RestaurantSettings } from '../types';
import { formatBs } from '../utils/currency';

interface TicketPrintModalProps {
  type: 'kitchen' | 'receipt';
  batch?: KitchenTicketBatch | null;
  order?: Order | null;
  settings: RestaurantSettings;
  onClose: () => void;
  onPrinted?: () => void;
}

export default function TicketPrintModal({
  type,
  batch,
  order,
  settings,
  onClose,
  onPrinted,
}: TicketPrintModalProps) {
  const [printed, setPrinted] = useState(false);

  const handlePrint = () => {
    window.print();
    setPrinted(true);
    if (onPrinted) onPrinted();
  };

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('es-ES')} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header bar (hidden on print) */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50 print:hidden">
          <div className="flex items-center gap-2">
            {type === 'kitchen' ? (
              <ChefHat className="w-5 h-5 text-amber-600" />
            ) : (
              <Receipt className="w-5 h-5 text-emerald-600" />
            )}
            <h3 className="font-semibold text-neutral-900 text-sm md:text-base">
              {type === 'kitchen' ? 'Comanda para Cocina (Ticket)' : 'Recibo / Cuenta de Mesa'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable thermal ticket preview */}
        <div className="p-6 bg-neutral-100 flex justify-center">
          <div
            id="thermal-ticket-content"
            className="w-full max-w-[320px] bg-white p-5 shadow-sm border border-neutral-300 font-mono text-xs text-neutral-950 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full"
          >
            {/* KITCHEN TICKET FORMAT */}
            {type === 'kitchen' && batch && (
              <div className="space-y-3">
                <div className="text-center border-b-2 border-dashed border-neutral-800 pb-3">
                  <p className="text-sm font-black uppercase tracking-wider">{settings?.restaurantName || 'RESTAURANTE'}</p>
                  <p className="text-base font-black uppercase bg-neutral-900 text-white px-2 py-0.5 my-1 inline-block">
                    *** COMANDA DE COCINA ***
                  </p>
                  {batch.isAddition ? (
                    <div className="mt-1 bg-amber-100 border border-amber-500 text-amber-900 px-2 py-1 font-bold text-xs uppercase">
                      ⚠️ ¡PEDIDO ADICIONAL! (RONDA {batch.round})
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-neutral-600">RONDA 1 (INICIAL)</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 text-xs border-b border-dashed border-neutral-600 pb-2">
                  <div>
                    <span className="text-neutral-500">MESA:</span>{' '}
                    <span className="text-base font-black">{batch.tableName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500">PEDIDO:</span>{' '}
                    <span className="text-sm font-bold">#{batch.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">MESONERO:</span>{' '}
                    <span className="font-bold">{batch.waiterName}</span>
                  </div>
                  <div className="text-right text-[11px] text-neutral-600">
                    {formattedDate(batch.createdAt)}
                  </div>
                </div>

                <div className="py-2 space-y-3">
                  <div className="text-[11px] font-bold uppercase text-neutral-500 border-b border-neutral-300 pb-1 flex justify-between">
                    <span>CANT / PRODUCTO</span>
                    <span>RONDA</span>
                  </div>

                  {batch.items.map((item, idx) => (
                    <div key={idx} className="border-b border-neutral-200 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black bg-neutral-200 px-1.5 py-0.5 rounded-xs">
                            {item.quantity}x
                          </span>
                          <span className="text-sm font-black leading-tight">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-sans">R{item.round}</span>
                      </div>
                      {item.notes && (
                        <div className="mt-1 pl-7 text-xs font-black text-amber-950 bg-amber-50 border-l-2 border-amber-500 px-1.5 py-0.5">
                          👉 NOTA: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-neutral-800 pt-2 text-center text-[10px] text-neutral-500">
                  <p>-- FIN DE COMANDA COCINA --</p>
                  <p className="mt-1">Impreso: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            )}

            {/* CUSTOMER BILL / RECEIPT FORMAT */}
            {type === 'receipt' && order && (
              <div className="space-y-3">
                <div className="text-center border-b border-dashed border-neutral-800 pb-3">
                  <p className="text-base font-black uppercase tracking-wide">{settings?.restaurantName || 'RESTAURANTE'}</p>
                  <p className="text-[11px] text-neutral-600">{settings.address}</p>
                  <p className="text-[11px] text-neutral-600">Telf: {settings.phone}</p>
                  <div className="mt-1 font-bold text-xs uppercase border border-neutral-900 inline-block px-3 py-0.5">
                    {order.status === 'pagada' ? 'RECIBO DE PAGO' : 'PRE-CUENTA DE MESA'}
                  </div>
                </div>

                <div className="text-xs space-y-0.5 border-b border-dashed border-neutral-600 pb-2">
                  <div className="flex justify-between">
                    <span>Mesa: <strong>{order.tableName}</strong></span>
                    <span>Pedido: <strong>#{order.orderNumber}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mesonero: {order.waiterName}</span>
                    <span>Personas: {order.customerCount}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-500">
                    <span>Fecha: {formattedDate(order.createdAt)}</span>
                    {order.paidAt && <span>Pago: {formattedDate(order.paidAt)}</span>}
                  </div>
                </div>

                <div className="py-2 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-neutral-500 border-b border-neutral-300 pb-1 flex justify-between">
                    <span>DESCRIPCIÓN</span>
                    <span>TOTAL</span>
                  </div>

                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold">
                          {item.quantity}x {item.name}
                        </span>
                        <span>{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 flex justify-between">
                        <span>@{settings.currencySymbol}{item.price.toFixed(2)} c/u {item.round > 1 ? `(Adicional R${item.round})` : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-neutral-800 pt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{settings.currencySymbol}{order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>IVA / Impuesto ({order.taxPercent}%):</span>
                      <span>{settings.currencySymbol}{order.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.tipAmount > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Propina voluntaria:</span>
                      <span>{settings.currencySymbol}{order.tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Descuento aplicado:</span>
                      <span>-{settings.currencySymbol}{order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-400 pt-1 space-y-0.5">
                    <div className="flex justify-between text-sm font-black">
                      <span>TOTAL USD ($):</span>
                      <span>{settings.currencySymbol}{order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-neutral-900">
                      <span>TOTAL BS.:</span>
                      <span>{formatBs(order.total, settings.bcvRate)}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-500 text-center py-1 border-y border-dashed border-neutral-300 my-1">
                    Tasa Oficial BCV: {formatBs(1, settings.bcvRate)} / $
                  </div>
                  {order.paymentMethod && (
                    <div className="flex justify-between text-[11px] pt-1 text-neutral-600">
                      <span className="uppercase">Método de pago:</span>
                      <span className="font-bold uppercase">{order.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  )}
                  {order.paymentReference && (
                    <div className="flex justify-between text-[10px] text-neutral-500">
                      <span>Referencia:</span>
                      <span>{order.paymentReference}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-neutral-600 pt-3 text-center text-[11px] text-neutral-600">
                  <p>{settings.receiptFooter}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions (hidden on print) */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 px-4 rounded-xl shadow-xs transition-colors"
          >
            {printed ? <Check className="w-4 h-4 text-emerald-400" /> : <Printer className="w-4 h-4" />}
            {printed ? 'Impreso de Nuevo' : 'Imprimir Ticket (Térmica / PC)'}
          </button>
        </div>
      </div>
    </div>
  );
}
