import { useState, useMemo, FormEvent } from 'react';
import {
  Users,
  ShieldCheck,
  Smartphone,
  ChefHat,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  Download,
  Search,
  Check,
  X,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { createUser, updateUser, deleteUser } from '../utils/api';

interface UserManagementTabProps {
  users: AppUser[];
  onRefresh: () => void;
}

export default function UserManagementTab({ users, onRefresh }: UserManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('mesonero');
  const [pin, setPin] = useState('1234');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Next automatic correlative ID
  const nextId = useMemo(() => {
    if (!users || users.length === 0) return 1;
    return Math.max(...users.map((u) => Number(u.id) || 0)) + 1;
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(u.id).includes(searchTerm);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setRole('mesonero');
    setPin(`${Math.floor(1000 + Math.random() * 9000)}`);
    setActive(true);
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
    setPin(user.pin || '');
    setActive(user.active);
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del usuario es obligatorio');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: name.trim(),
          role,
          pin: pin.trim(),
          active,
        });
        setSuccessMessage(`Usuario "${name}" actualizado con éxito`);
      } else {
        await createUser({
          name: name.trim(),
          role,
          pin: pin.trim(),
          active,
        });
        setSuccessMessage(`Usuario #${nextId} "${name}" creado con éxito`);
      }

      setShowModal(false);
      onRefresh();
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (user: AppUser) => {
    if (user.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        setError('No se puede eliminar el único administrador del sistema.');
        setTimeout(() => setError(null), 4000);
        return;
      }
    }
    setUserToDelete(user);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const target = userToDelete;
    setUserToDelete(null);

    try {
      await deleteUser(target.id);
      setSuccessMessage(`Usuario #${target.id} "${target.name}" eliminado correctamente`);
      onRefresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario');
      setTimeout(() => setError(null), 4000);
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            Admin (Acceso Total)
          </span>
        );
      case 'cocina':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
            <ChefHat className="w-3.5 h-3.5 text-amber-600" />
            Cocina / KDS
          </span>
        );
      case 'mesonero':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            Mesonero
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
              Gestión de Usuarios & Roles
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono font-bold border border-neutral-200">
              {users.length} Registrados
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Cada usuario tiene un <strong className="text-neutral-700">Id Usuario correlativo automático</strong> y un rol asignado: Mesonero (solo toma pedidos), Cocina (solo KDS) y Admin (sistema completo).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <a
            href="/api/sheets/export-csv-users"
            download
            className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-300 flex items-center gap-1.5 transition-colors"
            title="Descargar datos listos para importar en la pestaña 'Usuario' de Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Descargar CSV Hoja "Usuario"</span>
          </a>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl text-xs font-black theme-bg-primary text-neutral-950 flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar usuario por nombre o ID correlativo..."
            className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-neutral-900 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              roleFilter === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('mesonero')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              roleFilter === 'mesonero'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Mesoneros ({users.filter((u) => u.role === 'mesonero').length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('cocina')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              roleFilter === 'cocina'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Cocina ({users.filter((u) => u.role === 'cocina').length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              roleFilter === 'admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
            }`}
          >
            Admins ({users.filter((u) => u.role === 'admin').length})
          </button>
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Id Usuario (Automático)</th>
                <th className="py-3 px-4">Nombre de Usuario</th>
                <th className="py-3 px-4">Rol & Permisos</th>
                <th className="py-3 px-4">PIN de Acceso</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Fecha Creación</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No se encontraron usuarios con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-neutral-900 text-sm">
                      #{u.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900 text-sm">{u.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 border border-neutral-200">
                        {u.pin || 'Sin PIN'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

          {/* Google Sheets Information Card */}
          <div className="p-4 bg-neutral-50/70 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Compatibilidad con Google Sheets:</strong> La hoja de cálculo se denomina <strong>Usuario</strong> con columnas: <code className="text-neutral-800 font-mono font-bold bg-neutral-200/70 px-1 py-0.2 rounded">Id_Usuario | Nombre_Usuario | Rol | PIN | Estado | Fecha_Creacion</code>.
              </span>
            </div>
            <a
              href="/api/sheets/export-csv-users"
              download
              className="text-xs text-emerald-700 font-bold hover:underline shrink-0 flex items-center gap-1"
            >
              <span>Exportar CSV</span>
              <Download className="w-3 h-3" />
            </a>
          </div>
      </div>

      {/* Modal Crear / Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <h3 className="font-black text-sm text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-700" />
                <span>{editingUser ? `Editar Usuario #${editingUser.id}` : `Nuevo Usuario (Id #${nextId})`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Id Correlativo info */}
              <div className="bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <span className="text-neutral-600 font-medium">Id Usuario (Correlativo automático):</span>
                <span className="font-mono font-black text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                  #{editingUser ? editingUser.id : nextId}
                </span>
              </div>

              {/* Nombre de Usuario */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  Nombre del Usuario *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Carlos Mendoza, Chef Mario, etc."
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Rol selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  Rol del Usuario *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Mesonero */}
                  <button
                    type="button"
                    onClick={() => setRole('mesonero')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      role === 'mesonero'
                        ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-black shadow-xs ring-2 ring-blue-500/20'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 font-medium'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span className="text-xs">Mesonero</span>
                    <span className="text-[9px] text-neutral-500 leading-tight">Solo pedidos</span>
                  </button>

                  {/* Cocina */}
                  <button
                    type="button"
                    onClick={() => setRole('cocina')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      role === 'cocina'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-black shadow-xs ring-2 ring-amber-500/20'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 font-medium'
                    }`}
                  >
                    <ChefHat className="w-4 h-4 text-amber-600" />
                    <span className="text-xs">Cocina</span>
                    <span className="text-[9px] text-neutral-500 leading-tight">Solo KDS</span>
                  </button>

                  {/* Admin */}
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      role === 'admin'
                        ? 'border-purple-500 bg-purple-50/80 text-purple-900 font-black shadow-xs ring-2 ring-purple-500/20'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 font-medium'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span className="text-xs">Admin</span>
                    <span className="text-[9px] text-neutral-500 leading-tight">Todo el sistema</span>
                  </button>
                </div>
              </div>

              {/* PIN numérico */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1 flex items-center justify-between">
                  <span>PIN de Acceso (4 a 6 dígitos)</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Para inicio de sesión rápido</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 1234"
                    className="w-full bg-white border border-neutral-300 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Estado Activo */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">Usuario Activo</span>
                  <span className="text-[10px] text-neutral-500">Permite iniciar sesión en el sistema</span>
                </div>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-black theme-bg-primary text-neutral-950 shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">¿Eliminar Usuario?</h4>
                <p className="text-xs text-neutral-500">#{userToDelete.id} - {userToDelete.name}</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600">
              Esta acción eliminará al usuario y ya no podrá acceder al sistema con este PIN.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
