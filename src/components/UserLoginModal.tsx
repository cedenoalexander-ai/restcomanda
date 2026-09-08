import { useState, FormEvent } from 'react';
import {
  ShieldCheck,
  Smartphone,
  ChefHat,
  KeyRound,
  Lock,
  ArrowRight,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppUser, RestaurantSettings } from '../types';

interface UserLoginModalProps {
  isOpen?: boolean;
  users: AppUser[];
  currentUser?: AppUser | null;
  settings?: RestaurantSettings;
  onLogin?: (user: AppUser) => void;
  onSelectUser?: (user: AppUser) => void;
  onClose?: () => void;
  canCancel?: boolean;
}

export default function UserLoginModal({
  isOpen = true,
  users,
  currentUser,
  settings,
  onLogin,
  onSelectUser,
  onClose,
  canCancel = false,
}: UserLoginModalProps) {
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(
    currentUser || users.find(u => u.active) || users[0] || null
  );
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (isOpen === false) return null;

  const handleSelectUser = (user: AppUser) => {
    setSelectedUser(user);
    setPin('');
    setError(null);
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handlePinDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) {
      setError('Por favor seleccione un usuario');
      return;
    }

    // Verify PIN if user has one configured
    if (selectedUser.pin && selectedUser.pin.trim() !== '') {
      if (pin !== selectedUser.pin) {
        setError(`PIN incorrecto para ${selectedUser.name}. Intente de nuevo.`);
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onLogin) onLogin(selectedUser);
      if (onSelectUser) onSelectUser(selectedUser);
    }, 150);
  };

  const getRoleBadge = (role: AppUser['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            Admin (Acceso Total)
          </span>
        );
      case 'cocina':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200">
            <ChefHat className="w-3.5 h-3.5 text-amber-600" />
            Cocina / KDS
          </span>
        );
      case 'mesonero':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            Mesonero
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-neutral-900 text-white w-full max-w-lg rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl theme-bg-primary flex items-center justify-center font-black shadow-xs">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-tight">
                Iniciar Sesión por Usuario
              </h2>
              <p className="text-xs text-neutral-400">
                {settings?.restaurantName || 'Sistema de Restaurante'}
              </p>
            </div>
          </div>
          {canCancel && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Instructions */}
          <p className="text-xs text-neutral-300">
            Selecciona tu perfil de usuario para ingresar al sistema según tu rol asignado:
          </p>

          {/* User selector list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {users.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'border-white/40 bg-neutral-800 shadow-sm ring-2 ring-white/20'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[11px] font-mono font-bold text-neutral-400">
                      ID #{u.id}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white truncate">{u.name}</h4>
                    <div className="mt-1">{getRoleBadge(u.role)}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected user summary & PIN prompt */}
          {selectedUser && (
            <div className="bg-neutral-950 rounded-xl p-3.5 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
                    Usuario Seleccionado
                  </span>
                  <span className="text-sm font-black text-white">
                    {selectedUser.name}
                  </span>
                </div>
                <div>{getRoleBadge(selectedUser.role)}</div>
              </div>

              {/* Role explanation */}
              <div className="text-[11px] text-neutral-300 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800/80 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {selectedUser.role === 'mesonero' && 'Acceso exclusivo a la vista de Mesonero para abrir mesas y tomar comandas.'}
                  {selectedUser.role === 'cocina' && 'Acceso directo y exclusivo a la pantalla KDS de Cocina para preparación y tickets.'}
                  {selectedUser.role === 'admin' && 'Acceso total a todas las vistas: Mesonero, Cocina, Caja, Gestión & BCV y Google Sheets.'}
                </span>
              </div>

              {/* PIN input */}
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="user-pin-input" className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                    Código PIN de Acceso
                  </label>
                  {selectedUser.pin && (
                    <span className="text-[10px] text-neutral-400 font-mono">
                      (PIN Demo: <strong className="text-amber-400">{selectedUser.pin}</strong>)
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="user-pin-input"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ''));
                      setError(null);
                    }}
                    placeholder={selectedUser.pin ? "Ingrese su PIN" : "Sin PIN requerido"}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-white focus:outline-hidden focus:border-amber-400"
                  />
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 p-2 rounded-lg font-medium">
                    {error}
                  </p>
                )}

                {/* Numeric Pinpad for Touch / Mobile Screens */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePinDigit(num)}
                      className="py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold text-base transition-colors border border-neutral-800/80 active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPin('')}
                    className="py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs transition-colors border border-neutral-800/80"
                  >
                    Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePinDigit('0')}
                    className="py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold text-base transition-colors border border-neutral-800/80 active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handlePinDelete}
                    className="py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold text-xs transition-colors border border-neutral-800/80"
                  >
                    ⌫
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 rounded-xl theme-bg-primary font-black text-sm text-neutral-950 flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-98 transition-all"
                >
                  <span>Ingresar como {selectedUser.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
