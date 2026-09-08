import { useState, useEffect, useRef, useCallback } from 'react';
import {
  UtensilsCrossed,
  ChefHat,
  Receipt,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Bell,
  RefreshCw,
  Wifi,
  Smartphone,
  Monitor,
  UserCheck,
  LogOut,
  ShieldCheck,
  Users
} from 'lucide-react';
import { AppStateResponse, KitchenTicketBatch, Order, RestaurantSettings, AppUser } from './types';
import { fetchAppState } from './utils/api';
import { playKitchenChime } from './utils/audio';
import { applyTheme, getSavedThemeId } from './utils/theme';
import WaiterView from './components/WaiterView';
import KitchenView from './components/KitchenView';
import CashierView from './components/CashierView';
import GoogleSheetsView from './components/GoogleSheetsView';
import SettingsView from './components/SettingsView';
import AdminManagementView from './components/AdminManagementView';
import TicketPrintModal from './components/TicketPrintModal';
import UserLoginModal from './components/UserLoginModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

type ActiveView = 'waiter' | 'kitchen' | 'cashier' | 'admin' | 'sheets';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('waiter');
  const [appState, setAppState] = useState<AppStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('resto_sound') !== 'false';
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('resto_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Track previous batch IDs to sound notification when new batch/order comes in
  const knownBatchIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  // Ticket print modal state
  const [printModalData, setPrintModalData] = useState<{
    isOpen: boolean;
    type: 'kitchen' | 'receipt';
    batch?: KitchenTicketBatch | null;
    order?: Order | null;
  }>({
    isOpen: false,
    type: 'kitchen',
  });

  // Fetch state from server
  const loadData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      const data = await fetchAppState();
      setAppState(data);
      setError(null);

      // Check for new kitchen batches to chime
      if (data.orders) {
        const currentBatches = data.orders.flatMap((o) => o.batches || []);
        if (!isFirstLoad.current) {
          const hasNewBatch = currentBatches.some((b) => !knownBatchIds.current.has(b.id));
          if (hasNewBatch && soundEnabled) {
            playKitchenChime();
          }
        }
        knownBatchIds.current = new Set(currentBatches.map((b) => b.id));
      }
      isFirstLoad.current = false;
    } catch (err: any) {
      console.error('Failed to load state:', err);
      if (!isBackground) setError(err.message || 'Error de conexión');
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, [soundEnabled]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize dynamic theme colors
  useEffect(() => {
    if (appState?.settings?.themeColor) {
      applyTheme(appState.settings.themeColor);
    } else {
      applyTheme(getSavedThemeId());
    }
  }, [appState?.settings?.themeColor]);

  // Polling interval every 2.5 seconds so mobile & PC synchronize instantly
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, 2500);
    return () => clearInterval(interval);
  }, [loadData]);

  // If no user is logged in yet, prompt for login modal immediately
  useEffect(() => {
    if (!currentUser && appState?.users && appState.users.length > 0) {
      setShowLoginModal(true);
    }
  }, [currentUser, appState?.users]);

  // Enforce role-based view permissions
  // Mesonero: strictly 'waiter'
  // Cocina: strictly 'kitchen'
  // Admin: can access all views
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'mesonero' && activeView !== 'waiter') {
      setActiveView('waiter');
    } else if (currentUser.role === 'cocina' && activeView !== 'kitchen') {
      setActiveView('kitchen');
    }
  }, [currentUser, activeView]);

  const handleLoginUser = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('resto_active_user', JSON.stringify(user));
    setShowLoginModal(false);

    if (user.role === 'mesonero') {
      setActiveView('waiter');
    } else if (user.role === 'cocina') {
      setActiveView('kitchen');
    }
  };

  const handleLogout = () => {
    // Clear user and open login modal
    setCurrentUser(null);
    localStorage.removeItem('resto_active_user');
    setShowLoginModal(true);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('resto_sound', String(next));
      if (next) playKitchenChime();
      return next;
    });
  };

  const handleOpenKitchenPrint = (batch: KitchenTicketBatch) => {
    setPrintModalData({
      isOpen: true,
      type: 'kitchen',
      batch,
    });
  };

  const handleOpenReceiptPrint = (order: Order) => {
    setPrintModalData({
      isOpen: true,
      type: 'receipt',
      order,
    });
  };

  // Badge calculations
  const pendingKitchenBatchesCount = appState?.orders
    ? appState.orders
        .flatMap((o) => o.batches || [])
        .filter((b) => b.status === 'pendiente' || b.status === 'en_preparacion').length
    : 0;

  const occupiedTablesCount = appState?.tables
    ? appState.tables.filter((t) => t.status === 'ocupada' || t.status === 'cuenta_solicitada').length
    : 0;

  if (isLoading && !appState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h1 className="text-lg font-bold">RestoComanda</h1>
            <p className="text-xs text-neutral-400">Iniciando servidor del restaurante...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !appState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-neutral-200 text-center max-w-md space-y-4">
          <p className="text-rose-600 font-semibold">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  const settings = appState?.settings || {
    restaurantName: 'Restaurante & Grill El Portal',
    currencySymbol: '$',
    currencyCode: 'USD',
    taxPercent: 10,
    defaultTipPercent: 10,
    address: 'Av. Gastronómica #120',
    phone: '+1 (555) 342-9876',
    receiptFooter: '¡Gracias por su visita!',
    googleSheetsWebhookUrl: '',
  };

  const headerStyle = settings.headerStyle || 'dark';

  const headerBgClass =
    headerStyle === 'brand'
      ? 'theme-bg-primary border-b border-black/15 shadow-md sticky top-0 z-40'
      : headerStyle === 'light'
      ? 'bg-white text-neutral-900 border-b border-neutral-200 shadow-xs sticky top-0 z-40'
      : 'bg-neutral-950 text-white sticky top-0 z-40 border-b border-neutral-800 shadow-md';

  const navRowBgClass =
    headerStyle === 'brand'
      ? 'bg-black/15 border-black/10'
      : headerStyle === 'light'
      ? 'bg-neutral-50/95 border-neutral-200'
      : 'bg-neutral-900/95 border-neutral-800/80';

  const inactiveTabClass =
    headerStyle === 'brand'
      ? 'text-white/85 hover:text-white hover:bg-black/20'
      : headerStyle === 'light'
      ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70'
      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80';

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col antialiased">
      {/* GLOBAL TOP NAVIGATION */}
      <header className={headerBgClass}>
        {/* ROW 1: BRAND, RESTAURANT NAME & STATUS */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black shadow-xs shrink-0 ${
              headerStyle === 'brand' ? 'bg-black/25 text-white' : 'theme-bg-primary'
            }`}>
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-sm sm:text-base md:text-lg font-black tracking-tight leading-tight truncate ${
                  headerStyle === 'light' ? 'text-neutral-900' : 'text-white'
                }`}>
                  {settings.restaurantName}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-100/90 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  En línea
                </span>
              </div>
              <p className={`text-[10px] sm:text-xs truncate ${
                headerStyle === 'light' ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                Mesas: <span className="font-semibold text-neutral-200">{occupiedTablesCount} ocupadas</span> • Cocina: <span className="font-semibold text-neutral-200">{pendingKitchenBatchesCount} comandas</span>
              </p>
            </div>
          </div>

          {/* Quick Controls: Refresh & Sound & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PWA Install Button (auto-hides when installed) */}
            <PWAInstallButton />

            {/* User Profile / Switch Button */}
            <button
              type="button"
              onClick={handleLogout}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                headerStyle === 'brand'
                  ? 'bg-black/25 text-white hover:bg-black/35 border border-white/10'
                  : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
              }`}
              title="Haga clic para cambiar de usuario o ver credenciales"
            >
              <div className="w-6 h-6 rounded-lg theme-bg-primary text-neutral-950 flex items-center justify-center font-black text-[11px] shrink-0 shadow-2xs">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="font-black text-xs text-white truncate max-w-[120px]">
                  {currentUser ? currentUser.name : 'Iniciar Sesión'}
                </div>
                <div className="text-[10px] text-neutral-400 capitalize flex items-center gap-1">
                  {currentUser?.role === 'admin' ? (
                    <span className="text-purple-300 font-bold">Admin (Todo)</span>
                  ) : currentUser?.role === 'cocina' ? (
                    <span className="text-amber-300 font-bold">Cocina (KDS)</span>
                  ) : (
                    <span className="text-blue-300 font-bold">Mesonero (Pedidos)</span>
                  )}
                </div>
              </div>
              <LogOut className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? headerStyle === 'brand'
                    ? 'bg-black/20 text-white'
                    : 'bg-neutral-800 text-amber-400 hover:bg-neutral-700'
                  : 'text-neutral-500 hover:text-neutral-300 bg-neutral-900/60'
              }`}
              title={soundEnabled ? 'Sonido de comandas activado (Clic para silenciar)' : 'Sonido desactivado (Clic para activar)'}
            >
              <Bell className={`w-4 h-4 ${soundEnabled ? 'fill-current' : 'opacity-40'}`} />
              <span className="hidden md:inline text-[11px]">{soundEnabled ? 'Sonido ON' : 'Sonido OFF'}</span>
            </button>
            <button
              type="button"
              onClick={() => loadData(true)}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                headerStyle === 'brand'
                  ? 'bg-black/20 text-white hover:bg-black/30'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700'
              }`}
              title="Sincronizar ahora"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ROW 2: VIEWS NAVIGATION BAR (FILTERED BY USER ROLE) */}
        {currentUser?.role === 'admin' ? (
          <div className={`w-full border-t ${navRowBgClass}`}>
            <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2">
              <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none scroll-smooth flex-1">
                {/* Mesonero */}
                <button
                  type="button"
                  onClick={() => setActiveView('waiter')}
                  className={`min-h-[42px] sm:min-h-[38px] px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    activeView === 'waiter'
                      ? headerStyle === 'brand' ? 'bg-white text-neutral-950 shadow-xs' : 'theme-bg-primary shadow-xs'
                      : inactiveTabClass
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Mesonero</span>
                </button>

                {/* Cocina / KDS */}
                <button
                  type="button"
                  onClick={() => setActiveView('kitchen')}
                  className={`min-h-[42px] sm:min-h-[38px] relative px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    activeView === 'kitchen'
                      ? headerStyle === 'brand' ? 'bg-white text-neutral-950 shadow-xs' : 'theme-bg-primary shadow-xs'
                      : inactiveTabClass
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Cocina</span>
                  {pendingKitchenBatchesCount > 0 && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-rose-500 text-white animate-pulse shadow-2xs"
                    >
                      {pendingKitchenBatchesCount}
                    </span>
                  )}
                </button>

                {/* Caja / Cobro */}
                <button
                  type="button"
                  onClick={() => setActiveView('cashier')}
                  className={`min-h-[42px] sm:min-h-[38px] px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    activeView === 'cashier'
                      ? headerStyle === 'brand' ? 'bg-white text-neutral-950 shadow-xs' : 'theme-bg-primary shadow-xs'
                      : inactiveTabClass
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Caja & Cuentas</span>
                </button>

                {/* Gestión & BCV */}
                <button
                  type="button"
                  onClick={() => setActiveView('admin')}
                  className={`min-h-[42px] sm:min-h-[38px] px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    activeView === 'admin'
                      ? headerStyle === 'brand' ? 'bg-white text-neutral-950 shadow-xs' : 'theme-bg-primary shadow-xs'
                      : inactiveTabClass
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Gestión & BCV</span>
                </button>

                {/* Google Sheets */}
                <button
                  type="button"
                  onClick={() => setActiveView('sheets')}
                  className={`min-h-[42px] sm:min-h-[38px] px-3.5 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    activeView === 'sheets'
                      ? headerStyle === 'brand' ? 'bg-white text-neutral-950 shadow-xs' : 'theme-bg-primary shadow-xs'
                      : inactiveTabClass
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Google Sheets</span>
                </button>
              </nav>

              <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Modo Administrador Total</span>
              </span>
            </div>
          </div>
        ) : currentUser?.role === 'mesonero' ? (
          <div className={`w-full border-t ${navRowBgClass}`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="font-bold text-white shrink-0">Mesas & Comandas:</span>
                <span className="text-neutral-300 truncate hidden sm:inline">
                  Toca una mesa libre para abrir comanda o una ocupada para agregar platos adicionales
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Mesonero: {currentUser.name}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1">
        {activeView === 'waiter' && appState && (
          <WaiterView
            tables={appState.tables}
            orders={appState.orders}
            menu={appState.menu}
            categories={appState.categories}
            settings={settings}
            waiters={appState.waiters || []}
            currentUserName={currentUser?.name}
            onRefresh={() => loadData(true)}
            onOpenReceipt={handleOpenReceiptPrint}
          />
        )}

        {activeView === 'kitchen' && appState && (
          <KitchenView
            orders={appState.orders}
            settings={settings}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onRefresh={() => loadData(true)}
            onPrintBatch={handleOpenKitchenPrint}
          />
        )}

        {activeView === 'cashier' && appState && (
          <CashierView
            tables={appState.tables}
            orders={appState.orders}
            settings={settings}
            onRefresh={() => loadData(true)}
            onPrintReceipt={handleOpenReceiptPrint}
          />
        )}

        {activeView === 'admin' && appState && (
          <AdminManagementView
            waiters={appState.waiters || []}
            menu={appState.menu}
            tables={appState.tables}
            settings={settings}
            categories={appState.categories}
            users={appState.users || []}
            onRefresh={() => loadData(true)}
          />
        )}

        {activeView === 'sheets' && appState && (
          <GoogleSheetsView
            orders={appState.orders}
            settings={settings}
            onRefresh={() => loadData(true)}
            onPrintReceipt={handleOpenReceiptPrint}
          />
        )}
      </main>

      {/* USER LOGIN MODAL */}
      {showLoginModal && (
        <UserLoginModal
          users={appState?.users || []}
          currentUser={currentUser}
          settings={settings}
          onSelectUser={handleLoginUser}
          onClose={() => setShowLoginModal(false)}
          canCancel={currentUser !== null}
        />
      )}

      {/* THERMAL TICKET PRINT MODAL */}
      {printModalData.isOpen && (
        <TicketPrintModal
          type={printModalData.type}
          batch={printModalData.batch}
          order={printModalData.order}
          settings={settings}
          onClose={() => setPrintModalData({ isOpen: false, type: 'kitchen' })}
          onPrinted={() => loadData(true)}
        />
      )}

      {/* OFFLINE STATUS TOAST */}
      <OfflineIndicator />
    </div>
  );
}
