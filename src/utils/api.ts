import { AppStateResponse, MenuItem, Order, Table, RestaurantSettings, Waiter, AppUser, UserRole } from '../types';
import {
  localGetState,
  localCreateOrder,
  localAddOrderItems,
  localUpdateBatchStatus,
  localRequestBill,
  localPayOrder,
  localCancelOrder,
  localUpdateSettings,
  localResetDemo,
  localCreateUser,
  localUpdateUser,
  localDeleteUser,
  localTestWebhook,
  localSyncUsers,
  localSyncAllOrders,
  localCreateMenuItem,
  localUpdateMenuItem,
  localDeleteMenuItem,
  localCreateTable,
  localUpdateTable,
  localDeleteTable,
  localSyncMenu,
  localSyncTables,
  localSyncUrl,
  syncLocalDBWithServerState
} from './clientStorage';

// Automatic detection: if on GitHub Pages, or if API calls fail, fallback to localStorage
let isStaticClientMode = false;

if (typeof window !== 'undefined') {
  if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') {
    isStaticClientMode = true;
  }
}

export async function fetchAppState(): Promise<AppStateResponse> {
  if (isStaticClientMode) {
    return localGetState();
  }
  try {
    const res = await fetch('/api/state');
    if (!res.ok) {
      isStaticClientMode = true;
      return localGetState();
    }
    const contentType = res.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      // Returned HTML (e.g. 404 fallback page on static host)
      isStaticClientMode = true;
      return localGetState();
    }
    const data = await res.json();
    // Keep clientStorage in sync with server state
    syncLocalDBWithServerState(data);
    isStaticClientMode = false;
    return data;
  } catch {
    isStaticClientMode = true;
    return localGetState();
  }
}

export async function createOrder(data: {
  tableId: string;
  waiterName: string;
  customerCount: number;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
}): Promise<{ message: string; order: Order }> {
  if (isStaticClientMode) {
    return localCreateOrder(data);
  }
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      isStaticClientMode = true;
      return localCreateOrder(data);
    }
    return await res.json();
  } catch {
    isStaticClientMode = true;
    return localCreateOrder(data);
  }
}

export async function addOrderItems(orderId: string, data: {
  waiterName?: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
}): Promise<{ message: string; order: Order }> {
  if (isStaticClientMode) {
    return localAddOrderItems(orderId, data);
  }
  try {
    const res = await fetch(`/api/orders/${orderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      isStaticClientMode = true;
      return localAddOrderItems(orderId, data);
    }
    return await res.json();
  } catch {
    isStaticClientMode = true;
    return localAddOrderItems(orderId, data);
  }
}

export async function updateBatchStatus(batchId: string, status?: string, markPrinted?: boolean) {
  if (isStaticClientMode) {
    return localUpdateBatchStatus(batchId, status, markPrinted);
  }
  try {
    const res = await fetch(`/api/batches/${batchId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, markPrinted }),
    });
    if (!res.ok) {
      isStaticClientMode = true;
      return localUpdateBatchStatus(batchId, status, markPrinted);
    }
    return await res.json();
  } catch {
    isStaticClientMode = true;
    return localUpdateBatchStatus(batchId, status, markPrinted);
  }
}

export async function requestBill(orderId: string) {
  if (isStaticClientMode) {
    return localRequestBill(orderId);
  }
  try {
    const res = await fetch(`/api/orders/${orderId}/request-bill`, {
      method: 'POST',
    });
    if (!res.ok) {
      isStaticClientMode = true;
      return localRequestBill(orderId);
    }
    return await res.json();
  } catch {
    isStaticClientMode = true;
    return localRequestBill(orderId);
  }
}

export async function payOrder(orderId: string, data: {
  paymentMethod: string;
  paymentReference?: string;
  tipPercent?: number;
  tipAmount?: number;
  discountAmount?: number;
}): Promise<{ message: string; order: Order }> {
  if (isStaticClientMode) {
    return localPayOrder(orderId, data);
  }
  try {
    const res = await fetch(`/api/orders/${orderId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      isStaticClientMode = true;
      return localPayOrder(orderId, data);
    }
    return await res.json();
  } catch {
    isStaticClientMode = true;
    return localPayOrder(orderId, data);
  }
}

export async function cancelOrder(orderId: string) {
  if (isStaticClientMode) {
    return localCancelOrder(orderId);
  }
  try {
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'POST',
    });
    if (!res.ok) {
      isStaticClientMode = true;
      return localCancelOrder(orderId);
    }
    return await res.json();
  } catch {
    isStaticClientMode = true;
    return localCancelOrder(orderId);
  }
}

export async function updateSettings(settings: Partial<RestaurantSettings>) {
  if (isStaticClientMode) {
    return localUpdateSettings(settings);
  }
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      isStaticClientMode = true;
      return localUpdateSettings(settings);
    }
    return await res.json();
  } catch {
    isStaticClientMode = true;
    return localUpdateSettings(settings);
  }
}

export async function syncGoogleSheets(webhookUrl?: string) {
  if (isStaticClientMode) {
    return localSyncAllOrders(webhookUrl);
  }
  try {
    const res = await fetch('/api/sheets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    if (!res.ok) {
      return localSyncAllOrders(webhookUrl);
    }
    return await res.json();
  } catch {
    return localSyncAllOrders(webhookUrl);
  }
}

export async function testGoogleSheetsWebhook(webhookUrl?: string) {
  if (isStaticClientMode) {
    return localTestWebhook(webhookUrl);
  }
  try {
    const res = await fetch('/api/sheets/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    if (!res.ok) {
      return localTestWebhook(webhookUrl);
    }
    return await res.json();
  } catch {
    return localTestWebhook(webhookUrl);
  }
}

export async function syncUsersToGoogleSheets(webhookUrl?: string) {
  if (isStaticClientMode) {
    return localSyncUsers(webhookUrl);
  }
  try {
    const res = await fetch('/api/sheets/sync-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    if (!res.ok) {
      return localSyncUsers(webhookUrl);
    }
    return await res.json();
  } catch {
    return localSyncUsers(webhookUrl);
  }
}

export async function syncTablesToGoogleSheets(webhookUrl?: string) {
  if (isStaticClientMode) {
    return localSyncTables(webhookUrl);
  }
  try {
    const res = await fetch('/api/sheets/sync-tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    if (!res.ok) {
      return localSyncTables(webhookUrl);
    }
    return await res.json();
  } catch {
    return localSyncTables(webhookUrl);
  }
}

export async function syncMenuToGoogleSheets(webhookUrl?: string) {
  if (isStaticClientMode) {
    return localSyncMenu(webhookUrl);
  }
  try {
    const res = await fetch('/api/sheets/sync-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    if (!res.ok) {
      return localSyncMenu(webhookUrl);
    }
    return await res.json();
  } catch {
    return localSyncMenu(webhookUrl);
  }
}

export async function syncUrlToGoogleSheets(webhookUrl?: string, bcvRate?: number) {
  if (isStaticClientMode) {
    return localSyncUrl(webhookUrl, bcvRate);
  }
  try {
    const res = await fetch('/api/sheets/sync-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl, bcvRate }),
    });
    if (!res.ok) {
      return localSyncUrl(webhookUrl, bcvRate);
    }
    return await res.json();
  } catch {
    return localSyncUrl(webhookUrl, bcvRate);
  }
}

export async function fetchBcvFromGoogleSheets(webhookUrl?: string): Promise<{
  success: boolean;
  bcvRate?: number;
  message?: string;
  error?: string;
}> {
  if (isStaticClientMode) {
    return { success: false, message: 'Operando en modo local/desconectado' };
  }
  try {
    const query = webhookUrl ? `?webhookUrl=${encodeURIComponent(webhookUrl)}` : '';
    const res = await fetch(`/api/sheets/get-bcv${query}`);
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al conectar con Google Sheets' };
  }
}

// -------------------------------------------------------------
// WAITERS API
// -------------------------------------------------------------

export async function createWaiter(data: { name: string; code?: string; phone?: string; active?: boolean }): Promise<{ message: string; waiter: Waiter }> {
  const res = await fetch('/api/waiters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al crear mesonero');
  return json;
}

export async function updateWaiter(id: string, data: Partial<Waiter>): Promise<{ message: string; waiter: Waiter }> {
  const res = await fetch(`/api/waiters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al actualizar mesonero');
  return json;
}

export async function deleteWaiter(id: string): Promise<{ message: string; id: string }> {
  const res = await fetch(`/api/waiters/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al eliminar mesonero');
  return json;
}

// -------------------------------------------------------------
// MENU ITEMS API
// -------------------------------------------------------------

export async function createMenuItem(data: Partial<MenuItem>): Promise<{ message: string; item: MenuItem }> {
  let localItem: any = null;
  try {
    const localRes = localCreateMenuItem(data);
    localItem = localRes.item;
  } catch {}

  try {
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  return { message: 'Plato agregado al menú', item: localItem || (data as any) };
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<{ message: string; item: MenuItem }> {
  let localItem: any = null;
  try {
    const localRes = localUpdateMenuItem(id, data);
    localItem = localRes.item;
  } catch {}

  try {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  return { message: 'Plato actualizado', item: localItem || (data as any) };
}

export async function deleteMenuItem(id: string): Promise<{ message: string; item?: MenuItem }> {
  try {
    localDeleteMenuItem(id);
  } catch {}

  try {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  return { message: 'Plato eliminado del menú' };
}

// -------------------------------------------------------------
// TABLES API
// -------------------------------------------------------------

export async function createTable(data: { name: string; capacity: number; zone?: string }): Promise<{ message: string; table: Table }> {
  if (isStaticClientMode) {
    return localCreateTable(data);
  }
  try {
    const res = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return localCreateTable(data);
    }
    return await res.json();
  } catch {
    return localCreateTable(data);
  }
}

export async function updateTable(id: string, data: Partial<Table>): Promise<{ message: string; table: Table }> {
  if (isStaticClientMode) {
    return localUpdateTable(id, data);
  }
  try {
    const res = await fetch(`/api/tables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return localUpdateTable(id, data);
    }
    return await res.json();
  } catch {
    return localUpdateTable(id, data);
  }
}

export async function deleteTable(id: string): Promise<{ message: string; id?: string; table?: Table }> {
  if (isStaticClientMode) {
    return localDeleteTable(id);
  }
  try {
    const res = await fetch(`/api/tables/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      return localDeleteTable(id);
    }
    return await res.json();
  } catch {
    return localDeleteTable(id);
  }
}

export async function resetDemoData() {
  if (isStaticClientMode) {
    return localResetDemo();
  }
  try {
    const res = await fetch('/api/reset-demo', { method: 'POST' });
    if (!res.ok) return localResetDemo();
    return await res.json();
  } catch {
    return localResetDemo();
  }
}

// -------------------------------------------------------------
// USERS API (Gestión de Usuarios & Roles)
// -------------------------------------------------------------

export async function createUser(data: {
  name: string;
  role: UserRole;
  pin?: string;
  active?: boolean;
}): Promise<{ message: string; user: AppUser }> {
  if (isStaticClientMode) {
    return localCreateUser(data);
  }
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return localCreateUser(data);
    return await res.json();
  } catch {
    return localCreateUser(data);
  }
}

export async function updateUser(
  id: number,
  data: Partial<AppUser>
): Promise<{ message: string; user: AppUser }> {
  if (isStaticClientMode) {
    return localUpdateUser(id, data);
  }
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return localUpdateUser(id, data);
    return await res.json();
  } catch {
    return localUpdateUser(id, data);
  }
}

export async function deleteUser(id: number): Promise<{ message: string; id: number }> {
  if (isStaticClientMode) {
    return localDeleteUser(id);
  }
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) return localDeleteUser(id);
    return await res.json();
  } catch {
    return localDeleteUser(id);
  }
}
