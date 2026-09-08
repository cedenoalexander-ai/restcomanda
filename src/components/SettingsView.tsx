import { useState, type FormEvent } from 'react';
import { Settings, Save, Plus, Edit2, Trash2, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { MenuItem, RestaurantSettings, Table } from '../types';
import { updateSettings } from '../utils/api';

interface SettingsViewProps {
  settings: RestaurantSettings;
  menu: MenuItem[];
  tables: Table[];
  categories: string[];
  onRefresh: () => void;
}

export default function SettingsView({
  settings,
  menu,
  tables,
  categories,
  onRefresh,
}: SettingsViewProps) {
  const [formData, setFormData] = useState<RestaurantSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New dish form
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState(categories[0] || 'Platos Fuertes');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishNotes, setNewDishNotes] = useState('Sin cebolla, Término medio, Salsa aparte');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      showToast('Configuración del restaurante guardada');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDish = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDishName,
          category: newDishCategory,
          price: parseFloat(newDishPrice),
          description: newDishDesc,
          quickNotes: newDishNotes.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error('Error al agregar plato');
      showToast('Plato agregado al menú');
      setNewDishName('');
      setNewDishPrice('');
      setNewDishDesc('');
      setShowAddDish(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al agregar plato');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-100 text-neutral-900 p-4 md:p-6 pb-20">
      {toast && (
        <div className="fixed top-18 right-4 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Settings Form */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Datos del Restaurante & Facturación
              </h2>
              <p className="text-xs text-neutral-500">
                Información impresa en tickets de cocina, pre-cuentas y recibos fiscales.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Nombre del Restaurante / Local:
                </label>
                <input
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Teléfono de Contacto:
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Dirección Física:
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Mensaje al Pie del Recibo:
                </label>
                <input
                  type="text"
                  value={formData.receiptFooter}
                  onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Símbolo de Moneda (ej: $, Bs, €):
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Porcentaje de IVA / Impuesto (%):
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="50"
                  value={formData.taxPercent}
                  onChange={(e) => setFormData({ ...formData, taxPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Menu items list & management */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-neutral-700" />
                <span>Platos y Bebidas del Menú ({menu.length})</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Gestiona los precios y platos disponibles para los mesoneros.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddDish(!showAddDish)}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddDish ? 'Cerrar' : 'Nuevo Plato'}</span>
            </button>
          </div>

          {/* Add dish form */}
          {showAddDish && (
            <form onSubmit={handleAddDish} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
              <h4 className="font-bold text-neutral-900">Agregar Nuevo Producto al Menú</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-medium text-neutral-700 block mb-1">Nombre del Plato / Bebida:</label>
                  <input
                    type="text"
                    required
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="Ej: Tequeños de Queso"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">Precio ({formData.currencySymbol}):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    placeholder="6.50"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">Categoría:</label>
                  <select
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="font-medium text-neutral-700 block mb-1">Notas rápidas de preparación (separadas por coma):</label>
                  <input
                    type="text"
                    value={newDishNotes}
                    onChange={(e) => setNewDishNotes(e.target.value)}
                    placeholder="Sin cebolla, Término medio, Salsa aparte"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="font-medium text-neutral-700 block mb-1">Descripción de ingredientes:</label>
                  <input
                    type="text"
                    value={newDishDesc}
                    onChange={(e) => setNewDishDesc(e.target.value)}
                    placeholder="Ingredientes frescos y preparación artesanal..."
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddDish(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg font-bold"
                >
                  Guardar Plato
                </button>
              </div>
            </form>
          )}

          {/* Dish list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 text-xs">
            {menu.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">{item.name}</span>
                    <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[11px] line-clamp-1">{item.description}</p>
                </div>
                <span className="font-bold text-sm text-neutral-900 shrink-0">
                  {settings.currencySymbol}{item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
