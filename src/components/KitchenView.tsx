import { useState, useMemo } from 'react';
import {
  ChefHat,
  Printer,
  Clock,
  CheckCircle,
  Flame,
  Bell,
  BellOff,
  Filter,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { KitchenTicketBatch, Order, RestaurantSettings } from '../types';
import { updateBatchStatus } from '../utils/api';

interface KitchenViewProps {
  orders: Order[];
  settings: RestaurantSettings;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  onPrintBatch: (batch: KitchenTicketBatch) => void;
}

export default function KitchenView({
  orders,
  settings,
  soundEnabled,
  onToggleSound,
  onRefresh,
  onPrintBatch,
}: KitchenViewProps) {
  const [activeTab, setActiveTab] = useState<'activas' | 'listas' | 'todas'>('activas');

  // Extract all batches from open/active orders
  const allBatches = useMemo(() => {
    const list: KitchenTicketBatch[] = [];
    orders.forEach((ord) => {
      if (ord.status !== 'cancelada') {
        ord.batches.forEach((b) => list.push(b));
      }
    });
    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const filteredBatches = useMemo(() => {
    if (activeTab === 'activas') {
      return allBatches.filter((b) => b.status === 'pendiente' || b.status === 'en_preparacion');
    }
    if (activeTab === 'listas') {
      return allBatches.filter((b) => b.status === 'listo');
    }
    return allBatches;
  }, [allBatches, activeTab]);

  const handleStatusChange = async (batchId: string, newStatus: string) => {
    try {
      await updateBatchStatus(batchId, newStatus);
      onRefresh();
    } catch (err) {
      console.error('Error changing batch status:', err);
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Ahora mismo';
    if (mins === 1) return 'Hace 1 min';
    return `Hace ${mins} min`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-950 text-neutral-100 p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto w-full space-y-5">
        {/* Kitchen Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Pantalla de Cocina (KDS & Comandas)</span>
              </h2>
              <p className="text-xs text-neutral-400">
                Recepción automática de comandas, impresión de tickets y control de pedidos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Audio Alert Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                soundEnabled
                  ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
              title="Activar/desactivar timbre de nueva comanda"
            >
              {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span>{soundEnabled ? 'Sonido: Activado' : 'Sonido: Silenciado'}</span>
            </button>

            {/* Filter Tabs */}
            <div className="flex items-center bg-neutral-800 p-1 rounded-xl border border-neutral-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('activas')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'activas'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Por Hacer ({allBatches.filter((b) => b.status === 'pendiente' || b.status === 'en_preparacion').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('listas')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'listas'
                    ? 'bg-emerald-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Listos ({allBatches.filter((b) => b.status === 'listo').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('todas')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'todas'
                    ? 'bg-neutral-700 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Historial ({allBatches.length})
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filteredBatches.length === 0 && (
          <div className="py-20 text-center space-y-3 bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-800">
            <ChefHat className="w-12 h-12 text-neutral-600 mx-auto stroke-1" />
            <p className="text-base font-medium text-neutral-400">
              No hay comandas {activeTab === 'activas' ? 'pendientes en cocina' : 'en esta sección'}.
            </p>
            <p className="text-xs text-neutral-600">
              Cuando un mesonero tome o agregue un pedido en una mesa, aparecerá aquí al instante.
            </p>
          </div>
        )}

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((batch) => {
            const isPending = batch.status === 'pendiente';
            const isInPrep = batch.status === 'en_preparacion';
            const isReady = batch.status === 'listo';
            const isDelivered = batch.status === 'entregado';

            return (
              <div
                key={batch.id}
                className={`flex flex-col justify-between rounded-2xl border transition-all overflow-hidden ${
                  batch.isAddition
                    ? 'border-amber-500/80 bg-neutral-900 shadow-md ring-1 ring-amber-500/30'
                    : 'border-neutral-800 bg-neutral-900'
                }`}
              >
                {/* Ticket Top Header */}
                <div>
                  <div
                    className={`p-3.5 flex items-center justify-between border-b ${
                      batch.isAddition
                        ? 'bg-amber-950/40 border-amber-500/30'
                        : 'bg-neutral-800/60 border-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">
                          {batch.tableName}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">
                          #{batch.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        Mesonero: <strong>{batch.waiterName}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      {batch.isAddition ? (
                        <div className="bg-amber-500 text-neutral-950 text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide inline-flex items-center gap-1 shadow-xs">
                          <Flame className="w-3.5 h-3.5" />
                          <span>¡ADICIONAL R{batch.round}!</span>
                        </div>
                      ) : (
                        <div className="bg-neutral-700 text-neutral-200 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase">
                          Ronda 1 (Inicial)
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-1 text-[11px] text-neutral-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{getElapsedTime(batch.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-4 space-y-3">
                    {batch.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="pb-2.5 border-b border-neutral-800/80 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-lg font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                            {it.quantity}x
                          </span>
                          <span className="text-base font-bold text-white leading-tight">
                            {it.name}
                          </span>
                        </div>

                        {/* Cooking Notes Alert */}
                        {it.notes ? (
                          <div className="mt-1.5 ml-8 p-2 rounded-lg bg-amber-900/30 border-l-3 border-amber-400 text-amber-200 text-xs font-semibold flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                            <span>NOTA: {it.notes}</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Footer Action Buttons */}
                <div className="p-3.5 bg-neutral-950/80 border-t border-neutral-800/80 space-y-2">
                  {/* Status indicator */}
                  <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
                    <span>Estado comanda:</span>
                    <span
                      className={`font-bold uppercase ${
                        isPending
                          ? 'text-rose-400'
                          : isInPrep
                          ? 'text-amber-400'
                          : isReady
                          ? 'text-emerald-400'
                          : 'text-neutral-500'
                      }`}
                    >
                      {isPending
                        ? '⏳ Pendiente'
                        : isInPrep
                        ? '🔥 En Preparación'
                        : isReady
                        ? '✅ Listo para Servir'
                        : 'Entregado'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Print ticket button */}
                    <button
                      type="button"
                      onClick={() => onPrintBatch(batch)}
                      className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>{batch.printedAt ? 'Re-imprimir' : 'Imprimir Ticket'}</span>
                    </button>

                    {/* Progression button */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(batch.id, 'en_preparacion')}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>En Preparación</span>
                      </button>
                    )}

                    {isInPrep && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(batch.id, 'listo')}
                        className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Marcar Listo</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(batch.id, 'entregado')}
                        className="py-2.5 px-3 rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-200 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Entregado a Mesa</span>
                      </button>
                    )}

                    {isDelivered && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(batch.id, 'en_preparacion')}
                        className="py-2.5 px-3 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white text-xs flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reabrir</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
