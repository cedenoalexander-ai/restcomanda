import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Minus,
  Trash2,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Receipt,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Tag,
  FileText
} from 'lucide-react';
import { MenuItem, Order, Table, RestaurantSettings, Waiter } from '../types';
import { createOrder, addOrderItems, requestBill } from '../utils/api';
import { formatBs, formatDual, formatUSD } from '../utils/currency';

interface WaiterViewProps {
  tables: Table[];
  orders: Order[];
  menu: MenuItem[];
  categories: string[];
  settings: RestaurantSettings;
  waiters?: Waiter[];
  currentUserName?: string;
  onRefresh: () => void;
  onOpenReceipt: (order: Order) => void;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

export default function WaiterView({
  tables,
  orders,
  menu,
  categories,
  settings,
  waiters = [],
  currentUserName,
  onRefresh,
  onOpenReceipt,
}: WaiterViewProps) {
  // Waiter identity
  const [waiterName, setWaiterName] = useState<string>(() => {
    if (currentUserName) return currentUserName;
    return localStorage.getItem('resto_waiter_name') || (waiters[0]?.name || 'Carlos Mendoza');
  });
  const [isEditingWaiter, setIsEditingWaiter] = useState(false);

  useEffect(() => {
    if (currentUserName) {
      setWaiterName(currentUserName);
    }
  }, [currentUserName]);

  // Selected table
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Mode: 'view_table' (inspect active table) or 'ordering' (selecting items)
  const [isOrderingMode, setIsOrderingMode] = useState(false);
  const [isAddingAdditional, setIsAddingAdditional] = useState(false);

  // New order metadata
  const [customerCount, setCustomerCount] = useState<number>(2);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Item customization modal
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived selected table & active order
  const selectedTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId);
  }, [tables, selectedTableId]);

  const activeOrder = useMemo(() => {
    if (!selectedTableId) return null;
    return orders.find(
      (o) => o.tableId === selectedTableId && o.status !== 'pagada' && o.status !== 'cancelada'
    );
  }, [orders, selectedTableId]);

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      if (!item.available) return false;
      const matchCategory =
        selectedCategory === 'Todos' || item.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.quantity, 0);
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTableId(table.id);
    const existingOrder = orders.find(
      (o) => o.tableId === table.id && o.status !== 'pagada' && o.status !== 'cancelada'
    );

    if (existingOrder) {
      // Table is occupied: go to table detail view where waiter can add items or ask for bill
      setIsOrderingMode(false);
      setIsAddingAdditional(false);
    } else {
      // Table is free: go directly to taking a new order
      setCart([]);
      setCustomerCount(table.capacity);
      setIsOrderingMode(true);
      setIsAddingAdditional(false);
    }
  };

  const handleStartAddition = () => {
    setCart([]);
    setIsOrderingMode(true);
    setIsAddingAdditional(true);
  };

  const handleOpenCustomize = (item: MenuItem) => {
    // Check if already in cart
    const existingInCart = cart.find((c) => c.menuItemId === item.id);
    setCustomizingItem(item);
    if (existingInCart) {
      setItemQuantity(existingInCart.quantity);
      setItemNotes(existingInCart.notes);
    } else {
      setItemQuantity(1);
      setItemNotes('');
    }
  };

  const handleAddQuickNote = (note: string) => {
    if (itemNotes.includes(note)) {
      // Remove note
      const filtered = itemNotes
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== note && s !== '')
        .join(', ');
      setItemNotes(filtered);
    } else {
      // Add note
      setItemNotes(itemNotes ? `${itemNotes}, ${note}` : note);
    }
  };

  const handleSaveToCart = () => {
    if (!customizingItem) return;

    setCart((prev) => {
      const idx = prev.findIndex((c) => c.menuItemId === customizingItem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: itemQuantity,
          notes: itemNotes.trim(),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            menuItemId: customizingItem.id,
            name: customizingItem.name,
            price: customizingItem.price,
            quantity: itemQuantity,
            notes: itemNotes.trim(),
          },
        ];
      }
    });

    setCustomizingItem(null);
  };

  const handleQuickAdd = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.menuItemId === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          notes: '',
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  };

  // Submit order to kitchen
  const handleSubmitOrder = async () => {
    if (!selectedTable) return;
    if (cart.length === 0) {
      showToast('Seleccione al menos un producto para enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isAddingAdditional && activeOrder) {
        // Adding items to active order
        await addOrderItems(activeOrder.id, {
          waiterName,
          items: cart,
        });
        showToast(`¡Ronda Adicional enviada a Cocina para ${selectedTable.name}!`);
      } else {
        // New order
        await createOrder({
          tableId: selectedTable.id,
          waiterName,
          customerCount,
          items: cart,
        });
        showToast(`¡Comanda enviada a Cocina para ${selectedTable.name}!`);
      }

      setCart([]);
      setIsOrderingMode(false);
      setIsAddingAdditional(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al enviar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestBillAction = async () => {
    if (!activeOrder) return;
    try {
      await requestBill(activeOrder.id);
      showToast(`Cuenta solicitada para ${selectedTable?.name}`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al solicitar cuenta');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-100 text-neutral-900 pb-20 md:pb-8">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Waiter Navigation Bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-30 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {selectedTableId && (
              <button
                type="button"
                onClick={() => {
                  if (isOrderingMode && isAddingAdditional) {
                    setIsOrderingMode(false);
                  } else {
                    setSelectedTableId(null);
                    setIsOrderingMode(false);
                    setIsAddingAdditional(false);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Mesas</span>
              </button>
            )}

            <div>
              <h2 className="font-bold text-neutral-900 text-base md:text-lg flex items-center gap-2">
                {selectedTable ? (
                  <span>
                    {selectedTable.name}{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      ({selectedTable.capacity} pers.)
                    </span>
                  </span>
                ) : (
                  <span>Panel del Mesonero</span>
                )}
              </h2>
              {selectedTable && activeOrder && (
                <p className="text-xs text-neutral-500">
                  Pedido activo #{activeOrder.orderNumber} • Ronda{' '}
                  {activeOrder.batches.length}
                </p>
              )}
            </div>
          </div>

          {/* Waiter identity selector */}
          <div className="flex items-center gap-2">
            {currentUserName ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-xl text-xs font-medium text-neutral-800 border border-neutral-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Mesonero: <strong className="text-neutral-900">{currentUserName}</strong></span>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded ml-1">
                  En Turno
                </span>
              </div>
            ) : isEditingWaiter ? (
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
                {waiters && waiters.filter(w => w.active).length > 0 ? (
                  <select
                    value={waiterName}
                    onChange={(e) => {
                      setWaiterName(e.target.value);
                      localStorage.setItem('resto_waiter_name', e.target.value);
                      setIsEditingWaiter(false);
                    }}
                    className="px-2 py-1 text-xs border border-neutral-300 rounded-lg bg-white font-bold"
                  >
                    {waiters.filter(w => w.active).map(w => (
                      <option key={w.id} value={w.name}>
                        {w.name} (#{w.code || w.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={waiterName}
                    onChange={(e) => setWaiterName(e.target.value)}
                    placeholder="Tu nombre"
                    className="px-2 py-1 text-xs border border-neutral-300 rounded-lg bg-white"
                    autoFocus
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingWaiter(false);
                    localStorage.setItem('resto_waiter_name', waiterName);
                  }}
                  className="text-xs bg-neutral-900 text-white px-2.5 py-1 rounded-lg font-bold"
                >
                  Listo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingWaiter(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-medium text-neutral-800 transition-colors border border-neutral-200"
                title="Cambiar mesonero que atiende"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Mesonero: <strong>{waiterName}</strong></span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-4 flex-1">
        {/* VIEW 1: TABLE SELECTION (When no table is selected) */}
        {!selectedTableId && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="font-semibold text-lg text-neutral-900">
                  Selecciona una Mesa para Tomar Pedido
                </h3>
                <p className="text-sm text-neutral-500">
                  Toca una mesa libre para abrir comanda o una ocupada para ver su cuenta o agregar adicionales.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Libre
                </span>
                <span className="flex items-center gap-1 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Ocupada
                </span>
                <span className="flex items-center gap-1 text-neutral-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cuenta Pedida
                </span>
              </div>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {tables.map((table) => {
                const order = orders.find(
                  (o) => o.tableId === table.id && o.status !== 'pagada' && o.status !== 'cancelada'
                );
                const isOccupied = table.status === 'ocupada' || !!order;
                const isBillRequested = table.status === 'cuenta_solicitada' || order?.status === 'cuenta_solicitada';
                const isMyTable = order && order.waiterName === waiterName;

                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl text-left border transition-all shadow-xs flex flex-col justify-between min-h-[135px] ${
                      isBillRequested
                        ? 'bg-rose-50/90 border-rose-300 hover:border-rose-400 ring-1 ring-rose-200'
                        : isOccupied
                        ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400 ring-1 ring-amber-200'
                        : 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-black text-base text-neutral-900">
                          {table.name}
                        </span>
                        {isBillRequested ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Cuenta Pedida
                          </span>
                        ) : isOccupied ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Ocupada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Libre
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{table.capacity} pers.</span>
                        </div>
                        {table.zone && (
                          <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded font-medium truncate max-w-[90px]">
                            {table.zone}
                          </span>
                        )}
                      </div>

                      {/* Waiter assignment indicator */}
                      {isOccupied && order && (
                        <div className="mt-2 text-xs">
                          <div className="flex items-center gap-1 text-neutral-700">
                            <span className="text-[11px] text-neutral-500 font-normal">Mesonero:</span>
                            <span className="font-bold truncate text-neutral-900">{order.waiterName || 'Mesonero'}</span>
                          </div>
                          {isMyTable ? (
                            <span className="inline-block mt-0.5 text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                              Tu mesa
                            </span>
                          ) : (
                            <span className="inline-block mt-0.5 text-[9px] bg-neutral-200 text-neutral-700 font-medium px-1.5 py-0.2 rounded">
                              Atendida por otro mesonero
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                      {isBillRequested ? (
                        <span className="font-semibold text-rose-700 flex items-center gap-1 w-full justify-between">
                          <span className="flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5" /> Por Cobrar
                          </span>
                          <span className="font-bold">{order ? `${settings.currencySymbol}${order.total.toFixed(2)}` : ''}</span>
                        </span>
                      ) : isOccupied && order ? (
                        <div className="w-full">
                          <div className="flex justify-between font-bold text-neutral-900">
                            <span>#{order.orderNumber}</span>
                            <span className="text-amber-950 font-black">{settings.currencySymbol}{order.total.toFixed(2)}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 flex justify-between mt-0.5">
                            <span>{order.items.length} platos • R{order.batches.length}</span>
                            <span className="text-blue-600 font-bold">Ver / + Platos &rarr;</span>
                          </p>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-between text-emerald-700 font-bold">
                          <span className="flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Abrir Comanda
                          </span>
                          <span className="text-[10px] text-neutral-400 font-normal">Tocar aquí</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE OCCUPIED TABLE OVERVIEW (See items, add additional items, request bill) */}
        {selectedTable && !isOrderingMode && activeOrder && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-neutral-900">
                      {selectedTable.name} • Pedido #{activeOrder.orderNumber}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        activeOrder.status === 'cuenta_solicitada'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {activeOrder.status === 'cuenta_solicitada'
                        ? 'Cuenta Solicitada'
                        : 'En Consumo'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Mesonero: {activeOrder.waiterName} • Hora:{' '}
                    {new Date(activeOrder.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-400 block">Total Actual</span>
                  <span className="text-xl font-black text-neutral-900 block">
                    {settings.currencySymbol}
                    {activeOrder.total.toFixed(2)}
                  </span>
                  <span className="text-xs font-black text-emerald-700 block">
                    {formatBs(activeOrder.total, settings.bcvRate)}
                  </span>
                </div>
              </div>

              {/* Multi-waiter awareness banner */}
              {activeOrder.waiterName !== waiterName && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Mesa abierta por: {activeOrder.waiterName}</p>
                    <p className="text-amber-800 mt-0.5">
                      Esta mesa fue iniciada por otro mesonero. Como estás en turno como <strong>{waiterName}</strong>, puedes agregar platos adicionales si los comensales te ordenaron algo a ti.
                    </p>
                  </div>
                </div>
              )}

              {/* Batches / Rounds List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Rondas de Pedidos Realizadas ({activeOrder.batches.length})
                </h4>

                {activeOrder.batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-200">
                      <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                        {batch.isAddition ? (
                          <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-xs text-[10px]">
                            ADICIONAL
                          </span>
                        ) : (
                          <span className="bg-neutral-800 text-white px-1.5 py-0.2 rounded-xs text-[10px]">
                            INICIAL
                          </span>
                        )}
                        Ronda #{batch.round}
                      </span>
                      <span className="text-neutral-500">
                        {new Date(batch.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {batch.items.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between">
                          <div>
                            <span className="font-semibold text-neutral-800">
                              {item.quantity}x {item.name}
                            </span>
                            {item.notes && (
                              <p className="text-[11px] text-amber-800 font-medium">
                                Nota: {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="text-neutral-600 font-medium">
                            {settings.currencySymbol}
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons for Waiter */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartAddition}
                  className="w-full sm:flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>+ Pedir Algo Adicional (Nueva Ronda)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenReceipt(activeOrder)}
                  className="w-full sm:w-auto py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Ver Pre-cuenta</span>
                </button>

                {activeOrder.status !== 'cuenta_solicitada' && (
                  <button
                    type="button"
                    onClick={handleRequestBillAction}
                    className="w-full sm:w-auto py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors text-sm border border-rose-200"
                  >
                    <span>Solicitar Cuenta</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: MENU & CART ORDERING (For either New Order or Additional Items) */}
        {selectedTable && isOrderingMode && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left / Main: Menu selector */}
            <div className="lg:col-span-8 space-y-4">
              {/* Header banner indicating mode */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-base">
                      {isAddingAdditional
                        ? `Adicional para ${selectedTable.name}`
                        : `Nuevo Pedido - ${selectedTable.name}`}
                    </span>
                    {isAddingAdditional ? (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                        Ronda #{(activeOrder?.batches.length || 1) + 1}
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                        Ronda 1 (Inicial)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {isAddingAdditional
                      ? 'Los productos que agregues aquí se enviarán a cocina como comanda adicional.'
                      : 'Selecciona los platos y bebidas para la mesa.'}
                  </p>
                </div>

                {!isAddingAdditional && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 font-medium">Comensales:</span>
                    <div className="flex items-center border border-neutral-300 rounded-lg bg-neutral-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCustomerCount((prev) => Math.max(1, prev - 1))}
                        className="px-2 py-1 hover:bg-neutral-200 text-neutral-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-neutral-800">
                        {customerCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomerCount((prev) => prev + 1)}
                        className="px-2 py-1 hover:bg-neutral-200 text-neutral-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search & Categories */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar plato, bebida o ingrediente..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Todos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === 'Todos'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-neutral-900 text-white'
                          : 'bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredMenu.map((item) => {
                  const inCart = cart.find((c) => c.menuItemId === item.id);

                  return (
                    <div
                      key={item.id}
                      className={`bg-white p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        inCart
                          ? 'border-neutral-900 shadow-xs ring-1 ring-neutral-900'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-neutral-900 leading-snug">
                            {item.name}
                          </h4>
                          <div className="text-right shrink-0">
                            <span className="font-black text-sm text-neutral-900 block">
                              {settings.currencySymbol}
                              {item.price.toFixed(2)}
                            </span>
                            <span className="text-[11px] font-black text-emerald-700 block">
                              {formatBs(item.price, settings.bcvRate)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                        {inCart ? (
                          <div className="flex items-center gap-1.5 w-full justify-between">
                            <button
                              type="button"
                              onClick={() => handleOpenCustomize(item)}
                              className="text-xs text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{inCart.notes ? 'Ver notas' : '+ Notas'}</span>
                            </button>

                            <div className="flex items-center gap-2 bg-neutral-100 px-2 py-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.id, -1)}
                                className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-neutral-200 text-neutral-700"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black min-w-4 text-center">
                                {inCart.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.id, 1)}
                                className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-neutral-200 text-neutral-700"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => handleOpenCustomize(item)}
                              className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex items-center gap-1"
                              title="Personalizar con notas"
                            >
                              <Tag className="w-3 h-3" />
                              <span>Notas</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdd(item)}
                              className="flex-1 py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Agregar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right / Sidebar: Cart & Send to Kitchen */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs sticky top-36 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-neutral-900">
                      {isAddingAdditional ? 'Ronda Adicional' : 'Comanda para Cocina'}
                    </h3>
                    <span className="text-xs font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                      {cartItemCount}
                    </span>
                  </div>

                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-xs text-rose-600 hover:text-rose-800"
                    >
                      Vaciar
                    </button>
                  )}
                </div>

                {/* Items in Cart */}
                <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400 space-y-1">
                      <p className="text-sm">No hay productos seleccionados.</p>
                      <p className="text-xs">Toca "Agregar" en los platos del menú.</p>
                    </div>
                  ) : (
                    cart.map((c) => (
                      <div
                        key={c.menuItemId}
                        className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-neutral-900 leading-tight">
                            {c.name}
                          </span>
                          <span className="font-bold text-neutral-900 ml-2">
                            {settings.currencySymbol}
                            {(c.price * c.quantity).toFixed(2)}
                          </span>
                        </div>

                        {c.notes ? (
                          <p className="text-[11px] text-amber-900 font-medium bg-amber-50 p-1 rounded-xs border-l-2 border-amber-500">
                            👉 {c.notes}
                          </p>
                        ) : null}

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const mItem = menu.find((m) => m.id === c.menuItemId);
                              if (mItem) handleOpenCustomize(mItem);
                            }}
                            className="text-[11px] text-neutral-500 hover:text-neutral-800 underline"
                          >
                            {c.notes ? 'Editar notas' : '+ Agregar nota'}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(c.menuItemId, -1)}
                              className="w-5 h-5 rounded-md bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-bold px-1">{c.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(c.menuItemId, 1)}
                              className="w-5 h-5 rounded-md bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-100"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(c.menuItemId)}
                              className="text-neutral-400 hover:text-rose-600 ml-1 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal summary */}
                {cart.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200 space-y-1 text-xs">
                    <div className="flex justify-between items-baseline text-neutral-500">
                      <span>Total Comanda actual:</span>
                      <div className="text-right">
                        <span className="font-black text-neutral-900 text-sm block">
                          {settings.currencySymbol}
                          {cartTotal.toFixed(2)}
                        </span>
                        <span className="text-xs font-black text-emerald-700 block">
                          {formatBs(cartTotal, settings.bcvRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Send Button */}
                <button
                  type="button"
                  disabled={cart.length === 0 || isSubmitting}
                  onClick={handleSubmitOrder}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors ${
                    cart.length === 0 || isSubmitting
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : isAddingAdditional
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Enviando comanda...'
                      : isAddingAdditional
                      ? 'Enviar Adicional a Cocina'
                      : 'Enviar Pedido a Cocina'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ITEM CUSTOMIZATION MODAL (Quick Notes & Quantities) */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-neutral-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  {customizingItem.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  {settings.currencySymbol}
                  {customizingItem.price.toFixed(2)} c/u
                </p>
              </div>
              <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setItemQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs font-bold text-neutral-800"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-sm">
                  {itemQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setItemQuantity((prev) => prev + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs font-bold text-neutral-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick notes chips */}
            {customizingItem.quickNotes && customizingItem.quickNotes.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Instrucciones Rápidas de Cocina:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {customizingItem.quickNotes.map((note) => {
                    const isSelected = itemNotes.includes(note);
                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => handleAddQuickNote(note)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {isSelected ? `✓ ${note}` : `+ ${note}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Notes text input */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Nota Especial para el Cocinero:
              </label>
              <textarea
                rows={2}
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Ej: Término medio, salsa tártara aparte, sin hielo..."
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveToCart}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Guardar en Comanda ({settings.currencySymbol}
                {(customizingItem.price * itemQuantity).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
