import { useState, useMemo, type FormEvent } from 'react';
import {
  Users,
  UtensilsCrossed,
  Utensils,
  SquareDashedBottom,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  DollarSign,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  Phone,
  Hash,
  Layers,
  ArrowRightLeft,
  Palette,
  Brush,
  Sun,
  Moon,
  UserCheck,
  RefreshCw,
  Link2,
  ArrowDownToLine
} from 'lucide-react';
import { MenuItem, Table, RestaurantSettings, Waiter, AppUser } from '../types';
import UserManagementTab from './UserManagementTab';
import {
  createWaiter,
  updateWaiter,
  deleteWaiter,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createTable,
  updateTable,
  deleteTable,
  updateSettings,
  syncMenuToGoogleSheets,
  syncUrlToGoogleSheets,
  fetchBcvFromGoogleSheets
} from '../utils/api';
import { formatBs, formatDual, formatUSD } from '../utils/currency';
import { THEMES, THEME_LIST, applyTheme, getSavedThemeId, ThemeColorId } from '../utils/theme';

interface AdminManagementViewProps {
  waiters: Waiter[];
  menu: MenuItem[];
  tables: Table[];
  settings: RestaurantSettings;
  categories: string[];
  users?: AppUser[];
  onRefresh: () => void;
}

type AdminTab = 'users' | 'waiters' | 'menu' | 'tables' | 'bcv' | 'theme';

export default function AdminManagementView({
  waiters,
  menu,
  tables,
  settings,
  categories,
  users = [],
  onRefresh,
}: AdminManagementViewProps) {
  const [currentTab, setCurrentTab] = useState<AdminTab>('users');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // In-app confirmation modal for deletions (replaces window.confirm which is blocked in iframes)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    type: 'dish' | 'table' | 'waiter';
    id: string;
    name: string;
    warning?: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmModal) return;
    const target = deleteConfirmModal;
    setDeleteConfirmModal(null);

    try {
      if (target.type === 'dish') {
        await deleteMenuItem(target.id);
        showToast(`Plato "${target.name}" eliminado del menú`);
        onRefresh();
      } else if (target.type === 'table') {
        await deleteTable(target.id);
        showToast(`Mesa "${target.name}" eliminada`);
        onRefresh();
      } else if (target.type === 'waiter') {
        await deleteWaiter(target.id);
        showToast(`Mesonero "${target.name}" eliminado`);
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  // -------------------------------------------------------------
  // THEME STATE & HANDLERS
  // -------------------------------------------------------------
  const [selectedTheme, setSelectedTheme] = useState<ThemeColorId>(() => {
    return (settings.themeColor as ThemeColorId) || getSavedThemeId() || 'amber';
  });
  const [selectedHeaderStyle, setSelectedHeaderStyle] = useState<'dark' | 'brand' | 'light'>(() => {
    return settings.headerStyle || 'dark';
  });
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const handleSelectTheme = (themeId: ThemeColorId) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    showToast(`Color de interfaz cambiado a: ${THEMES[themeId].name}`);
  };

  const handleSaveThemeSettings = async () => {
    setIsSavingTheme(true);
    try {
      await updateSettings({
        ...settings,
        themeColor: selectedTheme,
        headerStyle: selectedHeaderStyle,
      });
      applyTheme(selectedTheme);
      showToast(`¡Configuración de colores guardada! Tema: ${THEMES[selectedTheme].name}`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar configuración de colores', 'error');
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleResetTheme = async () => {
    setSelectedTheme('amber');
    setSelectedHeaderStyle('dark');
    applyTheme('amber');
    try {
      await updateSettings({
        ...settings,
        themeColor: 'amber',
        headerStyle: 'dark',
      });
      showToast('Tema restablecido a Ámbar Gourmet por defecto');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al restablecer', 'error');
    }
  };

  // -------------------------------------------------------------
  // WAITERS STATE & HANDLERS
  // -------------------------------------------------------------
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
  const [waiterForm, setWaiterForm] = useState({
    name: '',
    code: '',
    phone: '',
    active: true,
  });

  const handleOpenNewWaiter = () => {
    setEditingWaiter(null);
    setWaiterForm({
      name: '',
      code: `${100 + waiters.length + 1}`,
      phone: '',
      active: true,
    });
    setShowWaiterModal(true);
  };

  const handleOpenEditWaiter = (waiter: Waiter) => {
    setEditingWaiter(waiter);
    setWaiterForm({
      name: waiter.name,
      code: waiter.code || '',
      phone: waiter.phone || '',
      active: waiter.active,
    });
    setShowWaiterModal(true);
  };

  const handleSaveWaiter = async (e: FormEvent) => {
    e.preventDefault();
    if (!waiterForm.name.trim()) return;

    try {
      if (editingWaiter) {
        await updateWaiter(editingWaiter.id, waiterForm);
        showToast(`Mesonero "${waiterForm.name}" modificado correctamente`);
      } else {
        await createWaiter(waiterForm);
        showToast(`Mesonero "${waiterForm.name}" registrado correctamente`);
      }
      setShowWaiterModal(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar mesonero', 'error');
    }
  };

  const handleDeleteWaiter = (waiter: Waiter) => {
    setDeleteConfirmModal({
      type: 'waiter',
      id: waiter.id,
      name: waiter.name,
      warning: 'El mesonero será eliminado del sistema y no podrá ser asignado a mesas.',
    });
  };

  const handleToggleWaiterActive = async (waiter: Waiter) => {
    try {
      await updateWaiter(waiter.id, { active: !waiter.active });
      showToast(`Mesonero ${!waiter.active ? 'activado' : 'pausado'}`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  // -------------------------------------------------------------
  // MENU ITEMS STATE & HANDLERS
  // -------------------------------------------------------------
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [dishForm, setDishForm] = useState({
    name: '',
    category: categories[0] || 'Platos Principales',
    price: '',
    description: '',
    quickNotes: 'Sin cebolla, Término medio, Salsa aparte',
    available: true,
  });

  const handleOpenNewDish = () => {
    setEditingDish(null);
    setDishForm({
      name: '',
      category: categories[0] || 'Platos Principales',
      price: '',
      description: '',
      quickNotes: 'Sin cebolla, Término medio, Salsa aparte',
      available: true,
    });
    setShowDishModal(true);
  };

  const handleOpenEditDish = (dish: MenuItem) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      category: dish.category,
      price: dish.price.toString(),
      description: dish.description || '',
      quickNotes: (dish.quickNotes || []).join(', '),
      available: dish.available,
    });
    setShowDishModal(true);
  };

  const handleSaveDish = async (e: FormEvent) => {
    e.preventDefault();
    const cleanPriceStr = dishForm.price.toString().replace(/[^0-9.,]/g, '').replace(',', '.');
    const priceNum = parseFloat(cleanPriceStr);

    if (!dishForm.name.trim()) {
      showToast('Por favor ingrese el nombre del plato', 'error');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Por favor ingrese un precio válido mayor a 0 (ej: 4.50)', 'error');
      return;
    }

    try {
      const payload = {
        name: dishForm.name.trim(),
        category: dishForm.category.trim() || categories[0] || 'Platos Principales',
        price: priceNum,
        description: dishForm.description.trim(),
        quickNotes: dishForm.quickNotes.split(',').map((s) => s.trim()).filter(Boolean),
        available: Boolean(dishForm.available),
      };

      if (editingDish) {
        await updateMenuItem(editingDish.id, payload);
        showToast(`Plato "${dishForm.name}" modificado con éxito`);
      } else {
        await createMenuItem(payload);
        showToast(`Plato "${dishForm.name}" agregado al menú`);
      }
      setShowDishModal(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar plato', 'error');
    }
  };

  const handleDeleteDish = (dish: MenuItem) => {
    setDeleteConfirmModal({
      type: 'dish',
      id: dish.id,
      name: dish.name,
      warning: 'Este plato será retirado del menú y no se podrá ordenar en nuevas comandas.',
    });
  };

  const [isSyncingMenuSheets, setIsSyncingMenuSheets] = useState(false);

  const handleSyncMenuSheets = async () => {
    setIsSyncingMenuSheets(true);
    try {
      const res = await syncMenuToGoogleSheets();
      showToast(res.message || 'Platos sincronizados con la pestaña "Platos" de Google Sheets');
    } catch (err: any) {
      showToast(err.message || 'Error al sincronizar con Google Sheets', 'error');
    } finally {
      setIsSyncingMenuSheets(false);
    }
  };

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuery =
        !menuSearch ||
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(menuSearch.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [menu, selectedCategory, menuSearch]);

  // -------------------------------------------------------------
  // TABLES STATE & HANDLERS
  // -------------------------------------------------------------
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableForm, setTableForm] = useState({
    name: '',
    capacity: '4',
    zone: 'Salón Principal',
  });

  const availableZones = ['Salón Principal', 'Terraza al Aire Libre', 'Área VIP', 'Barra de Tragos', 'Jardín Externo'];

  const handleOpenNewTable = () => {
    setEditingTable(null);
    setTableForm({
      name: `Mesa ${tables.length + 1}`,
      capacity: '4',
      zone: 'Salón Principal',
    });
    setShowTableModal(true);
  };

  const handleOpenEditTable = (table: Table) => {
    setEditingTable(table);
    setTableForm({
      name: table.name,
      capacity: table.capacity.toString(),
      zone: table.zone || 'Salón Principal',
    });
    setShowTableModal(true);
  };

  const handleSaveTable = async (e: FormEvent) => {
    e.preventDefault();
    if (!tableForm.name.trim()) return;

    try {
      const payload = {
        name: tableForm.name.trim(),
        capacity: parseInt(tableForm.capacity) || 4,
        zone: tableForm.zone,
      };

      if (editingTable) {
        await updateTable(editingTable.id, payload);
        showToast(`Mesa "${tableForm.name}" modificada`);
      } else {
        await createTable(payload);
        showToast(`Mesa "${tableForm.name}" agregada con éxito`);
      }
      setShowTableModal(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar mesa', 'error');
    }
  };

  const handleDeleteTable = (table: Table) => {
    if (table.status !== 'libre') {
      showToast('No puedes eliminar una mesa que está ocupada o con pedido activo.', 'error');
      return;
    }
    setDeleteConfirmModal({
      type: 'table',
      id: table.id,
      name: table.name,
      warning: 'La mesa será eliminada de la lista de mesas.',
    });
  };

  // -------------------------------------------------------------
  // BCV RATE & SETTINGS HANDLERS
  // -------------------------------------------------------------
  const [bcvInput, setBcvInput] = useState(settings.bcvRate?.toString() || '54.20');
  const [settingsForm, setSettingsForm] = useState<RestaurantSettings>(settings);
  const [isSavingBcv, setIsSavingBcv] = useState(false);
  const [isSyncingSheetsBcv, setIsSyncingSheetsBcv] = useState(false);
  const [isFetchingSheetsBcv, setIsFetchingSheetsBcv] = useState(false);

  const handleUpdateBcv = async (e: FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(bcvInput);
    if (isNaN(rate) || rate <= 0) {
      showToast('Por favor ingrese una tasa BCV válida mayor a 0', 'error');
      return;
    }

    setIsSavingBcv(true);
    try {
      await updateSettings({
        ...settingsForm,
        bcvRate: rate,
      });
      showToast(`Tasa BCV actualizada a Bs. ${rate.toFixed(2)} y sincronizada con Hoja "URL"`);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar tasa BCV', 'error');
    } finally {
      setIsSavingBcv(false);
    }
  };

  const handleSyncBcvToSheets = async () => {
    if (!settings.googleSheetsWebhookUrl) {
      showToast('Configura primero la URL de Google Sheets en la pestaña correspondiente', 'error');
      return;
    }
    const rate = parseFloat(bcvInput) || settings.bcvRate || 54.20;
    setIsSyncingSheetsBcv(true);
    try {
      await syncUrlToGoogleSheets(settings.googleSheetsWebhookUrl, rate);
      showToast(`¡Tasa BCV (Bs. ${rate.toFixed(2)}) guardada en la pestaña "URL" de Google Sheets!`);
    } catch (err: any) {
      showToast(err.message || 'Error al sincronizar con Google Sheets', 'error');
    } finally {
      setIsSyncingSheetsBcv(false);
    }
  };

  const handleFetchBcvFromSheets = async () => {
    if (!settings.googleSheetsWebhookUrl) {
      showToast('Configura primero la URL de Google Sheets en la pestaña correspondiente', 'error');
      return;
    }
    setIsFetchingSheetsBcv(true);
    try {
      const res = await fetchBcvFromGoogleSheets(settings.googleSheetsWebhookUrl);
      if (res.success && res.bcvRate) {
        setBcvInput(res.bcvRate.toString());
        showToast(`¡Tasa BCV obtenida de Google Sheets (Hoja URL): Bs. ${res.bcvRate.toFixed(2)}!`);
        onRefresh();
      } else {
        showToast(res.message || 'No se encontró la Tasa BCV en la pestaña "URL"', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al consultar Google Sheets', 'error');
    } finally {
      setIsFetchingSheetsBcv(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-100 text-neutral-900 p-3 sm:p-5 md:p-6 pb-24">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed top-18 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border transition-all ${
            toast.type === 'success'
              ? 'bg-neutral-900 text-white border-neutral-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header & BCV Quick Banner */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2">
              <span>Panel de Gestión y Configuración</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Administración completa de Mesoneros, Platos del Menú, Mesas y Tasa Oficial BCV para cálculo en Bolívares (Bs.).
            </p>
          </div>

          {/* Quick Header Badges: Theme & BCV */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Theme Switcher Button */}
            <button
              type="button"
              onClick={() => setCurrentTab('theme')}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all ${
                currentTab === 'theme'
                  ? 'theme-bg-primary shadow-xs'
                  : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">Color Interfaz</div>
                <div className="text-xs font-black flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                    style={{ backgroundColor: THEMES[selectedTheme]?.primary }}
                  />
                  <span>{THEMES[selectedTheme]?.name}</span>
                </div>
              </div>
            </button>

            {/* BCV Quick Highlight Badge */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 p-2.5 sm:p-3 rounded-2xl text-amber-950">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-amber-800">
                  Tasa Oficial BCV
                </div>
                <div className="text-base sm:text-lg font-black text-neutral-900">
                  1 {settings.currencySymbol} = {formatBs(1, settings.bcvRate)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentTab('bcv')}
                className="ml-2 text-xs font-bold text-amber-900 underline hover:text-amber-950"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
          <button
            type="button"
            onClick={() => setCurrentTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentTab === 'users'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Usuarios & Roles ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('waiters')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentTab === 'waiters'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Mesoneros ({waiters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('menu')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentTab === 'menu'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            <span>Platos & Menú ({menu.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('tables')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentTab === 'tables'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <SquareDashedBottom className="w-4 h-4 text-amber-400" />
            <span>Mesas ({tables.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('bcv')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentTab === 'bcv'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>Tasa BCV & Facturación</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('theme')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentTab === 'theme'
                ? 'theme-bg-primary shadow-xs'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Colores & Tema</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 0: USUARIOS & ROLES */}
        {/* ------------------------------------------------------------- */}
        {currentTab === 'users' && (
          <UserManagementTab users={users} onRefresh={onRefresh} />
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: MESONEROS */}
        {/* ------------------------------------------------------------- */}
        {currentTab === 'waiters' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Equipo de Mesoneros</h2>
                <p className="text-xs text-neutral-500">
                  Crea, modifica o elimina a los mesoneros autorizados para atender mesas y cargar comandas.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewWaiter}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Registrar Nuevo Mesonero</span>
              </button>
            </div>

            {/* Waiters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {waiters.map((waiter) => (
                <div
                  key={waiter.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between gap-4 transition-all ${
                    waiter.active ? 'border-neutral-200' : 'border-neutral-200 opacity-60 bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 font-black text-sm border border-neutral-200">
                        {waiter.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                          <span>{waiter.name}</span>
                          {waiter.code && (
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md">
                              #{waiter.code}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{waiter.phone || 'Sin teléfono asignado'}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleWaiterActive(waiter)}
                      className={`text-[10px] px-2 py-1 rounded-full font-bold border transition-colors ${
                        waiter.active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                      }`}
                    >
                      {waiter.active ? 'Activo' : 'Pausado'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                    <span className="text-[11px] text-neutral-400">
                      ID: {waiter.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditWaiter(waiter)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-700 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                        title="Modificar datos del mesonero"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWaiter(waiter)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                        title="Eliminar mesonero"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: PLATOS Y MENÚ */}
        {/* ------------------------------------------------------------- */}
        {currentTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Catálogo de Platos & Bebidas</h2>
                <p className="text-xs text-neutral-500">
                  Crea platos nuevos, modifica sus precios en dólares (calcula automáticamente en Bs. con la tasa BCV) y notas rápidas.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isSyncingMenuSheets}
                  onClick={handleSyncMenuSheets}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  title="Sincroniza todos los platos del menú con la pestaña 'Platos' de tu Google Sheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMenuSheets ? 'animate-spin' : ''}`} />
                  <span>{isSyncingMenuSheets ? 'Sincronizando...' : 'Sincronizar con Google Sheets'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewDish}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar Plato al Menú</span>
                </button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Buscar plato o ingrediente..."
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {/* Categories horizontally */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500 text-neutral-950 font-black'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Todos ({menu.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-neutral-950 font-black'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Table / Grid */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Plato / Producto</th>
                      <th className="py-3 px-3">Categoría</th>
                      <th className="py-3 px-3">Precio USD ($)</th>
                      <th className="py-3 px-3">Precio en Bs. (Tasa BCV)</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredMenu.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-neutral-900 text-sm">{item.name}</div>
                          <div className="text-[11px] text-neutral-500 line-clamp-1 max-w-sm">
                            {item.description || 'Sin descripción'}
                          </div>
                          {item.quickNotes && item.quickNotes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.quickNotes.map((note, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-medium"
                                >
                                  {note}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 font-semibold text-[11px]">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-black text-neutral-900 text-sm">
                          {settings.currencySymbol}{item.price.toFixed(2)}
                        </td>

                        <td className="py-3 px-3 font-black text-emerald-800 text-sm">
                          {formatBs(item.price, settings.bcvRate)}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.available
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.available ? 'Disponible' : 'Agotado'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditDish(item)}
                              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-colors font-bold flex items-center gap-1.5 text-xs cursor-pointer"
                              title="Modificar plato"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDish(item)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors font-bold flex items-center gap-1.5 text-xs border border-rose-200 cursor-pointer"
                              title="Eliminar plato"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredMenu.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                          <div className="max-w-sm mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                              <Utensils className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-neutral-800">No se encontraron platos</p>
                              <p className="text-xs text-neutral-500 mt-1">
                                No hay platos en esta categoría o con el término buscado.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleOpenNewDish}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-xl text-xs shadow-xs"
                            >
                              <Plus className="w-4 h-4" />
                              <span>+ Agregar Plato al Menú</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: MESAS */}
        {/* ------------------------------------------------------------- */}
        {currentTab === 'tables' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Configuración de Mesas & Zonas</h2>
                <p className="text-xs text-neutral-500">
                  Crea mesas nuevas, define su capacidad de puestos, zona (Salón, Terraza, VIP, Barra) y administra su ubicación.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewTable}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Crear Nueva Mesa</span>
              </button>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((table) => {
                const isOccupied = table.status === 'ocupada' || table.status === 'cuenta_solicitada';

                return (
                  <div
                    key={table.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between gap-3 transition-all ${
                      isOccupied ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                          <Layers className="w-3 h-3 text-neutral-400" />
                          <span>{table.zone || 'Salón Principal'}</span>
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            table.status === 'libre'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {table.status === 'libre' ? 'Libre' : 'Ocupada'}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-neutral-900">{table.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Capacidad: <strong>{table.capacity} comensales</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {table.id}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTable(table)}
                          className="px-2.5 py-1 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleDeleteTable(table)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                            isOccupied
                              ? 'text-neutral-300 cursor-not-allowed'
                              : 'hover:bg-rose-50 text-rose-600'
                          }`}
                          title={isOccupied ? 'No se puede eliminar una mesa ocupada' : 'Eliminar mesa'}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: TASA BCV & FACTURACIÓN */}
        {/* ------------------------------------------------------------- */}
        {currentTab === 'bcv' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tasa BCV Box */}
            <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-neutral-900">
                    Tasa Oficial del Banco Central de Venezuela (BCV)
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Se multiplica por el precio base en dólares ($) para obtener el monto exacto en Bolívares (Bs.).
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateBcv} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Valor actual de 1 Dólar ($) en Bolívares (Bs.):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-500 text-sm">
                      Bs.
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={bcvInput}
                      onChange={(e) => setBcvInput(e.target.value)}
                      placeholder="Ej: 54.20"
                      className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-2 border-neutral-300 rounded-xl text-lg font-black text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {settings.bcvLastUpdated
                      ? `Última actualización de la tasa: ${new Date(settings.bcvLastUpdated).toLocaleString()}`
                      : 'Tasa base del sistema'}
                  </p>
                </div>

                {/* Live Simulation Calculator */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Simulación de conversión en tiempo real:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-neutral-500 text-[10px] font-bold">$1.00 USD</div>
                      <div className="font-black text-neutral-900">
                        {formatBs(1, parseFloat(bcvInput) || settings.bcvRate)}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-neutral-500 text-[10px] font-bold">$10.00 USD</div>
                      <div className="font-black text-neutral-900">
                        {formatBs(10, parseFloat(bcvInput) || settings.bcvRate)}
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-neutral-200">
                      <div className="text-neutral-500 text-[10px] font-bold">$50.00 USD</div>
                      <div className="font-black text-neutral-900">
                        {formatBs(50, parseFloat(bcvInput) || settings.bcvRate)}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingBcv}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{isSavingBcv ? 'Guardando...' : 'Guardar y Actualizar Precios en Bs.'}</span>
                </button>
              </form>

              {/* Google Sheets URL Tab Sync Box */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                    <Link2 className="w-4 h-4 text-indigo-600" />
                    <span>Sincronización con Google Sheets (Pestaña "URL")</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-200 text-indigo-900">
                    Multi-dispositivo
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  La tasa oficial BCV se registra en la pestaña <strong>"URL"</strong> de Google Sheets para que todos los dispositivos de mesoneros, cocina y caja utilicen exactamente la misma tasa en tiempo real.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSyncingSheetsBcv}
                    onClick={handleSyncBcvToSheets}
                    className="flex-1 min-w-[130px] px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Envía la tasa actual a la pestaña 'URL' de Google Sheets"
                  >
                    <Link2 className={`w-3.5 h-3.5 ${isSyncingSheetsBcv ? 'animate-spin' : 'text-indigo-200'}`} />
                    <span>{isSyncingSheetsBcv ? 'Guardando...' : '🔗 Enviar a Hoja "URL"'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isFetchingSheetsBcv}
                    onClick={handleFetchBcvFromSheets}
                    className="flex-1 min-w-[130px] px-3 py-2 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Obtiene la tasa configurada en la pestaña 'URL' de Google Sheets"
                  >
                    <ArrowDownToLine className={`w-3.5 h-3.5 ${isFetchingSheetsBcv ? 'animate-spin' : 'text-indigo-600'}`} />
                    <span>{isFetchingSheetsBcv ? 'Consultando...' : '📥 Leer de Hoja "URL"'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* General Fiscal Settings */}
            <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-black">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-neutral-900">
                    Datos del Negocio & Recibos
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Nombre comercial, dirección y porcentajes para facturación.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Nombre del Restaurante:</label>
                  <input
                    type="text"
                    value={settingsForm.restaurantName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, restaurantName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Impuesto / IVA (%):</label>
                  <input
                    type="number"
                    value={settingsForm.taxPercent}
                    onChange={(e) => setSettingsForm({ ...settingsForm, taxPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Dirección:</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">Mensaje en Ticket / Recibo:</label>
                  <input
                    type="text"
                    value={settingsForm.receiptFooter}
                    onChange={(e) => setSettingsForm({ ...settingsForm, receiptFooter: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await updateSettings(settingsForm);
                      showToast('Datos de facturación actualizados');
                      onRefresh();
                    } catch (e: any) {
                      showToast(e.message || 'Error al guardar', 'error');
                    }
                  }}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Datos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: COLORES Y PERSONALIZACIÓN DE INTERFAZ */}
        {/* ------------------------------------------------------------- */}
        {currentTab === 'theme' && (
          <div className="space-y-6">
            {/* Header / Intro Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl theme-bg-primary flex items-center justify-center font-black shadow-sm shrink-0">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                    <span>Personalización de Colores & Identidad Visual</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                      En Vivo
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-500 max-w-2xl mt-0.5">
                    Selecciona la paleta cromática que mejor represente la personalidad y ambiente de tu restaurante.
                    Los cambios se actualizan en tiempo real en la barra de navegación, botones de comanda, badges de mesa y recibos.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetTheme}
                  className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all"
                >
                  Restablecer
                </button>
                <button
                  type="button"
                  onClick={handleSaveThemeSettings}
                  disabled={isSavingTheme}
                  className="px-5 py-2.5 theme-bg-primary font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingTheme ? 'Guardando...' : 'Guardar Colores'}</span>
                </button>
              </div>
            </div>

            {/* Palettes Grid */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-sm font-black text-neutral-900 flex items-center gap-2">
                    <Brush className="w-4 h-4 text-neutral-700" />
                    <span>Paletas Gastronómicas Diseñadas</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Haz clic en cualquier paleta para probarla de inmediato en toda la aplicación.
                  </p>
                </div>

                <div className="text-xs font-bold text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200">
                  Paleta seleccionada: <span className="font-black text-neutral-900">{THEMES[selectedTheme]?.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {THEME_LIST.map((th) => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => handleSelectTheme(th.id)}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50/50 shadow-md ring-2 ring-neutral-900/10'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white hover:shadow-xs'
                      }`}
                    >
                      {/* Top info */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                            {th.category}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              Activo
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-black text-neutral-900 leading-tight">
                          {th.name}
                        </h4>
                        <p className="text-[11px] text-neutral-500 mt-1 leading-normal">
                          {th.tagline}
                        </p>
                      </div>

                      {/* Swatch Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          Muestra de Tonos
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Primary */}
                          <div
                            className="w-7 h-7 rounded-lg shadow-2xs border border-black/10 flex items-center justify-center text-[10px] font-black"
                            style={{ backgroundColor: th.primary, color: th.primaryText }}
                            title="Color principal"
                          >
                            P
                          </div>
                          {/* Hover */}
                          <div
                            className="w-7 h-7 rounded-lg shadow-2xs border border-black/10"
                            style={{ backgroundColor: th.primaryHover }}
                            title="Tono hover"
                          />
                          {/* Light tint */}
                          <div
                            className="w-7 h-7 rounded-lg border border-black/10 flex-1"
                            style={{ backgroundColor: th.primaryLight, borderColor: th.primaryBorder }}
                            title="Tono pastel para badges y cajas"
                          />
                        </div>
                      </div>

                      {/* Button Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTheme(th.id);
                        }}
                        className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'theme-bg-primary font-black shadow-xs'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {isSelected ? '✓ Seleccionado' : 'Probar Este Color'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Header Style & Live Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Header Style Selector */}
              <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-black text-neutral-900 flex items-center gap-2">
                    <span>Estilo de la Barra Superior</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Define la apariencia de la cabecera fija y del menú superior.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: Dark (Default) */}
                  <div
                    onClick={() => setSelectedHeaderStyle('dark')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedHeaderStyle === 'dark'
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-black">
                        <Moon className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-neutral-900">
                          Barra Oscura Carbón (Recomendado)
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Fondo negro carbón con alto contraste para las pestañas de cocina y caja.
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedHeaderStyle === 'dark' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                      }`}>
                        {selectedHeaderStyle === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Brand Color */}
                  <div
                    onClick={() => setSelectedHeaderStyle('brand')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedHeaderStyle === 'brand'
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl theme-bg-primary flex items-center justify-center font-black shadow-xs">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-neutral-900">
                          Barra con Color de Marca
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Cabecera teñida por completo con el color principal del restaurante.
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedHeaderStyle === 'brand' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                      }`}>
                        {selectedHeaderStyle === 'brand' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Clean Light */}
                  <div
                    onClick={() => setSelectedHeaderStyle('light')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedHeaderStyle === 'light'
                        ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-neutral-300 text-neutral-900 flex items-center justify-center font-black">
                        <Sun className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-neutral-900">
                          Barra Blanca Minimalista
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Fondo blanco pulido, ideal para cafeterías, panaderías y bistros diurnos.
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedHeaderStyle === 'light' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                      }`}>
                        {selectedHeaderStyle === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Interactive Simulator Card */}
              <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-black text-neutral-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Simulador de Componentes en Vivo</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Vista previa de cómo lucen los botones y tarjetas con el color actual:
                  </p>
                </div>

                {/* Simulated UI elements */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  {/* Button sample */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600">Botón de Acción:</span>
                    <button
                      type="button"
                      className="px-4 py-2 theme-bg-primary font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Enviar Comanda a Cocina</span>
                    </button>
                  </div>

                  {/* Badge & Mesa sample */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600">Etiqueta de Mesa:</span>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-black theme-light-box border">
                        Mesa 4 • En Atención
                      </span>
                    </div>
                  </div>

                  {/* Dual price sample with BCV */}
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-neutral-900">Hamburguesa Clásica Especial</span>
                      <span className="text-xs font-black theme-text-primary">$10.50</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>Equivalente en Bolívares (BCV):</span>
                      <span className="font-bold text-emerald-800">
                        {formatBs(10.5, settings.bcvRate)}
                      </span>
                    </div>
                  </div>

                  {/* Tasa banner sample */}
                  <div className="p-2.5 rounded-xl border flex items-center justify-between theme-light-box">
                    <div className="text-[11px] font-bold">
                      Tasa Oficial del Día: 1 $ = {formatBs(1, settings.bcvRate)}
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md theme-bg-primary">
                      Activo
                    </span>
                  </div>
                </div>

                {/* Save banner inside simulator */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    ¿Te gusta esta combinación?
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveThemeSettings}
                    disabled={isSavingTheme}
                    className="px-4 py-2 theme-bg-primary font-black rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingTheme ? 'Guardando...' : 'Guardar y Aplicar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: MESONERO (CREAR / EDITAR) */}
      {/* ------------------------------------------------------------- */}
      {showWaiterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base text-neutral-900">
                {editingWaiter ? 'Modificar Mesonero' : 'Registrar Nuevo Mesonero'}
              </h3>
              <button
                type="button"
                onClick={() => setShowWaiterModal(false)}
                className="text-neutral-400 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWaiter} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Nombre Completo del Mesonero: *
                </label>
                <input
                  type="text"
                  required
                  value={waiterForm.name}
                  onChange={(e) => setWaiterForm({ ...waiterForm, name: e.target.value })}
                  placeholder="Ej: Roberto Alfonzo"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Código / PIN Mesonero:
                  </label>
                  <input
                    type="text"
                    value={waiterForm.code}
                    onChange={(e) => setWaiterForm({ ...waiterForm, code: e.target.value })}
                    placeholder="105"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Teléfono / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={waiterForm.phone}
                    onChange={(e) => setWaiterForm({ ...waiterForm, phone: e.target.value })}
                    placeholder="+58 412-0000000"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="waiterActiveCheck"
                  checked={waiterForm.active}
                  onChange={(e) => setWaiterForm({ ...waiterForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300"
                />
                <label htmlFor="waiterActiveCheck" className="font-medium text-neutral-800">
                  Mesonero Activo (aparece en la selección para tomar pedidos)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowWaiterModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold"
                >
                  {editingWaiter ? 'Guardar Cambios' : 'Registrar Mesonero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PLATO / MENÚ (CREAR / EDITAR) */}
      {/* ------------------------------------------------------------- */}
      {showDishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-neutral-900">
                    {editingDish ? `Modificar: ${editingDish.name}` : 'Agregar Nuevo Plato al Menú'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {editingDish ? 'Actualiza los datos, precio o disponibilidad' : 'Completa los datos para registrar el plato'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDishModal(false)}
                className="text-neutral-400 hover:text-neutral-800 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 block mb-1">
                    Nombre del Plato / Bebida: *
                  </label>
                  <input
                    type="text"
                    required
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    placeholder="Ej: Tequeños con Salsa Tártara"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Precio en USD ($): *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-400">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={dishForm.price}
                      onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                      placeholder="6.50"
                      className="w-full pl-7 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-black text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  {dishForm.price && !isNaN(parseFloat(dishForm.price.toString().replace(',', '.'))) && (
                    <div className="text-[10px] text-emerald-700 font-black mt-1">
                      ≈ {formatBs(parseFloat(dishForm.price.toString().replace(',', '.')), settings.bcvRate)}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Categoría:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    placeholder="O escribe nueva categoría..."
                    className="px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Notas Rápidas para Cocina (separadas por coma):
                </label>
                <input
                  type="text"
                  value={dishForm.quickNotes}
                  onChange={(e) => setDishForm({ ...dishForm, quickNotes: e.target.value })}
                  placeholder="Sin cebolla, Término medio, Salsa aparte"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Descripción / Ingredientes:
                </label>
                <textarea
                  rows={2}
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  placeholder="Descripción de la preparación o detalles..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <label htmlFor="dishAvailableCheck" className="font-bold text-neutral-900 block cursor-pointer">
                    Plato disponible para la venta
                  </label>
                  <span className="text-[10px] text-neutral-500">
                    Si está desmarcado, aparecerá como "Agotado" y no se podrá ordenar.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="dishAvailableCheck"
                  checked={dishForm.available}
                  onChange={(e) => setDishForm({ ...dishForm, available: e.target.checked })}
                  className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 border-neutral-300 cursor-pointer accent-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowDishModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingDish ? 'Guardar Cambios' : '+ Agregar Plato al Menú'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: MESA (CREAR / EDITAR) */}
      {/* ------------------------------------------------------------- */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base text-neutral-900">
                {editingTable ? 'Modificar Mesa' : 'Crear Nueva Mesa'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-neutral-400 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Nombre o Identificador de la Mesa: *
                </label>
                <input
                  type="text"
                  required
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  placeholder="Ej: Mesa 14, Terraza 3, Barra VIP"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Capacidad (Personas):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Zona / Ubicación:
                  </label>
                  <select
                    value={tableForm.zone}
                    onChange={(e) => setTableForm({ ...tableForm, zone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {availableZones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold"
                >
                  {editingTable ? 'Guardar Cambios' : 'Crear Mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------- */}
      {/* MODAL: CONFIRMACIÓN DE ELIMINAR (Plato / Mesa / Mesonero) */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-base">
                  {deleteConfirmModal.type === 'dish' && '¿Eliminar Plato del Menú?'}
                  {deleteConfirmModal.type === 'table' && '¿Eliminar Mesa?'}
                  {deleteConfirmModal.type === 'waiter' && '¿Eliminar Mesonero?'}
                </h4>
                <p className="text-xs font-black text-rose-700 mt-0.5">
                  "{deleteConfirmModal.name}"
                </p>
              </div>
            </div>

            {deleteConfirmModal.warning && (
              <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                {deleteConfirmModal.warning}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Sí, Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
