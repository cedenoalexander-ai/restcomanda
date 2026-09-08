import { AppStateResponse, MenuItem, Order, Table, RestaurantSettings, Waiter, AppUser, UserRole, KitchenBatchStatus } from '../types';

const INITIAL_CATEGORIES = [
  'Entradas',
  'Hamburguesas',
  'Platos Fuertes',
  'Pizzas',
  'Bebidas',
  'Cócteles',
  'Postres'
];

const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Tequeños Gourmet (6 uds)',
    category: 'Entradas',
    price: 6.5,
    description: 'Dedos crocantes rellenos de abundante queso blanco con salsa tártara de la casa.',
    quickNotes: ['Salsa aparte', 'Doble salsa', 'Bien tostados'],
    available: true,
  },
  {
    id: 'm2',
    name: 'Alitas BBQ Crujientes (8 uds)',
    category: 'Entradas',
    price: 8.0,
    description: 'Alitas glaseadas en salsa BBQ ahumada servidas con bastones de apio y aderezo ranch.',
    quickNotes: ['Picante medio', 'Muy picante', 'Salsa aparte'],
    available: true,
  },
  {
    id: 'm3',
    name: 'Empanaditas Mixtas (4 uds)',
    category: 'Entradas',
    price: 5.5,
    description: 'Carne mechada, pollo, queso y cazón con guasacaca artesanal.',
    quickNotes: ['Con guasacaca', 'Sin picante'],
    available: true,
  },
  {
    id: 'm4',
    name: 'Burger Clásica Especial',
    category: 'Hamburguesas',
    price: 10.5,
    description: '180g de carne de res premium, queso cheddar fundido, lechuga romana, tomate y salsa especial.',
    quickNotes: ['Sin cebolla', 'Sin tomate', 'Término medio', 'Bien cocido', 'Papas extra'],
    available: true,
  },
  {
    id: 'm5',
    name: 'Doble Smash Bacon Burger',
    category: 'Hamburguesas',
    price: 13.0,
    description: 'Dos discos smash crujientes, doble tocineta ahumada, queso americano y cebolla caramelizada.',
    quickNotes: ['Sin cebolla', 'Extra tocineta', 'Sin pepinillos', 'Salsa aparte'],
    available: true,
  },
  {
    id: 'm6',
    name: 'Pepito Mixto Especial 30cm',
    category: 'Hamburguesas',
    price: 12.0,
    description: 'Carne y pollo salteados sobre pan baguette suave, gratinado con queso parmesano y papas hilo.',
    quickNotes: ['Sin salsas', 'Salsas aparte', 'Extra queso'],
    available: true,
  },
  {
    id: 'm7',
    name: 'Parrilla Mixta de Solomo & Pollo',
    category: 'Platos Fuertes',
    price: 18.5,
    description: 'Cortes jugosos al grill acompañados de yuca frita, queso a la plancha, ensalada y guasacaca.',
    quickNotes: ['Término medio', 'Bien cocido', 'Yuca sancochada', 'Papas fritas'],
    available: true,
  },
  {
    id: 'm8',
    name: 'Churrasco de Solomo 350g',
    category: 'Platos Fuertes',
    price: 16.0,
    description: 'Corte magro a la brasa con mantequilla de hierbas finas y papas rústicas.',
    quickNotes: ['Término medio', 'Bien cocido'],
    available: true,
  },
  {
    id: 'm9',
    name: 'Pechuga Cordon Bleu Gourmet',
    category: 'Platos Fuertes',
    price: 14.0,
    description: 'Pechuga rellena de jamón ahumado y queso fundido, bañada en salsa de champiñones.',
    quickNotes: ['Salsa aparte', 'Sin champiñones'],
    available: true,
  },
  {
    id: 'm10',
    name: 'Pizza Pepperoni Suprema (Grande)',
    category: 'Pizzas',
    price: 14.5,
    description: 'Masa fermentada a mano, salsa pomodoro italiana, abundante mozzarella y pepperoni crocante.',
    quickNotes: ['Masa delgada', 'Extra queso', 'Bien tostada'],
    available: true,
  },
  {
    id: 'm11',
    name: 'Pizza Margarita & Albahaca Fresca',
    category: 'Pizzas',
    price: 12.0,
    description: 'Clásica con pomodoro, queso mozzarella fresco, albahaca genovesa y aceite de oliva.',
    quickNotes: ['Extra orégano', 'Sin albahaca'],
    available: true,
  },
  {
    id: 'm12',
    name: 'Cerveza Fría Artesanal / Polar',
    category: 'Bebidas',
    price: 2.5,
    description: 'Servida en copa bien helada (temperatura vestida de novia).',
    quickNotes: ['Bien fría', 'Con limón y sal'],
    available: true,
  },
  {
    id: 'm13',
    name: 'Jugo Natural de Frutas',
    category: 'Bebidas',
    price: 3.5,
    description: 'Frutas naturales frescas de temporada en agua o leche.',
    quickNotes: ['En agua', 'En leche', 'Sin azúcar', 'Con hielo'],
    available: true,
  },
  {
    id: 'm14',
    name: 'Refresco Lata 355ml',
    category: 'Bebidas',
    price: 2.0,
    description: 'Coca-Cola, Pepsi, 7Up o Chinotto bien frío.',
    quickNotes: ['Con hielo y limón', 'Sin hielo'],
    available: true,
  },
  {
    id: 'm15',
    name: 'Mojito Cubano de Menta Fresca',
    category: 'Cócteles',
    price: 6.0,
    description: 'Ron blanco añejo, hierbabuena fresca machacada, jugo de lima, azúcar de caña y soda.',
    quickNotes: ['Poco dulce', 'Fuerte de ron'],
    available: true,
  },
  {
    id: 'm16',
    name: 'Brownie Tibio con Helado de Vainilla',
    category: 'Postres',
    price: 5.5,
    description: 'Brownie húmedo de chocolate oscuro con nueces y bola de helado artesanal.',
    quickNotes: ['Helado aparte', 'Sin nueces'],
    available: true,
  }
];

const INITIAL_TABLES: Table[] = [
  { id: 't1', name: 'Mesa 1', capacity: 4, status: 'libre', zone: 'Salón Principal' },
  { id: 't2', name: 'Mesa 2', capacity: 2, status: 'libre', zone: 'Salón Principal' },
  { id: 't3', name: 'Mesa 3', capacity: 4, status: 'libre', zone: 'Salón Principal' },
  { id: 't4', name: 'Mesa 4', capacity: 6, status: 'libre', zone: 'Salón Principal' },
  { id: 't5', name: 'Mesa 5', capacity: 2, status: 'libre', zone: 'Salón Principal' },
  { id: 't6', name: 'Mesa 6', capacity: 4, status: 'libre', zone: 'Salón Principal' },
  { id: 't7', name: 'Mesa 7 (VIP)', capacity: 8, status: 'libre', zone: 'Área VIP' },
  { id: 't8', name: 'Terraza 1', capacity: 4, status: 'libre', zone: 'Terraza al Aire Libre' },
  { id: 't9', name: 'Terraza 2', capacity: 4, status: 'libre', zone: 'Terraza al Aire Libre' },
  { id: 't10', name: 'Barra 1', capacity: 2, status: 'libre', zone: 'Barra de Tragos' },
  { id: 't11', name: 'Barra 2', capacity: 2, status: 'libre', zone: 'Barra de Tragos' },
  { id: 't12', name: 'Mesa Jardín', capacity: 6, status: 'libre', zone: 'Jardín Externo' },
];

const INITIAL_WAITERS: Waiter[] = [
  { id: 'w1', name: 'Carlos Mendoza', code: '101', phone: '+58 412-1234567', active: true, createdAt: new Date().toISOString() },
  { id: 'w2', name: 'María González', code: '102', phone: '+58 414-7654321', active: true, createdAt: new Date().toISOString() },
  { id: 'w3', name: 'Alejandro Silva', code: '103', phone: '+58 416-5558899', active: true, createdAt: new Date().toISOString() },
  { id: 'w4', name: 'Andrea Pérez', code: '104', phone: '+58 424-9988776', active: true, createdAt: new Date().toISOString() },
];

const INITIAL_USERS: AppUser[] = [
  { id: 1, name: 'Administrador Principal', role: 'admin', pin: '1234', active: true, createdAt: new Date().toISOString() },
  { id: 2, name: 'Carlos Mendoza', role: 'mesonero', pin: '1111', active: true, createdAt: new Date().toISOString() },
  { id: 3, name: 'María González', role: 'mesonero', pin: '2222', active: true, createdAt: new Date().toISOString() },
  { id: 4, name: 'Chef Mario (Cocina)', role: 'cocina', pin: '3333', active: true, createdAt: new Date().toISOString() },
];

const INITIAL_SETTINGS: RestaurantSettings = {
  restaurantName: 'Restaurante & Grill El Portal',
  currencySymbol: '$',
  currencyCode: 'USD',
  bcvRate: 54.20,
  bcvLastUpdated: new Date().toISOString(),
  taxPercent: 10,
  defaultTipPercent: 10,
  address: 'Av. Principal Gastronómica #120',
  phone: '+1 (555) 342-9876',
  receiptFooter: '¡Gracias por su visita! Vuelva pronto.',
  googleSheetsWebhookUrl: '',
  googleSheetsLastSync: undefined,
  themeColor: 'amber',
  headerStyle: 'dark',
};

interface LocalDB {
  orderCounter: number;
  tables: Table[];
  menu: MenuItem[];
  categories: string[];
  settings: RestaurantSettings;
  orders: Order[];
  waiters: Waiter[];
  users: AppUser[];
}

const STORAGE_KEY = 'restocomanda_local_db_v1';

function getLocalDB(): LocalDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading from localStorage', e);
  }

  const initial: LocalDB = {
    orderCounter: 100,
    tables: INITIAL_TABLES,
    menu: INITIAL_MENU,
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_SETTINGS,
    orders: [],
    waiters: INITIAL_WAITERS,
    users: INITIAL_USERS,
  };
  saveLocalDB(initial);
  return initial;
}

function saveLocalDB(db: LocalDB) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

function calculateOrderTotals(order: Order, taxPercent: number) {
  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  order.subtotal = Number(subtotal.toFixed(2));
  order.taxAmount = Number(((order.subtotal * taxPercent) / 100).toFixed(2));
  const tip = order.tipAmount || 0;
  const discount = order.discountAmount || 0;
  order.total = Number((order.subtotal + order.taxAmount + tip - discount).toFixed(2));
}

// Direct Webhook dispatch to Google Sheets Apps Script
async function dispatchGoogleWebhook(webhookUrl: string, payload: any) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors', // Avoids cross-origin blocking on Google Apps Script redirect
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Direct Google Webhook dispatch error:', err);
  }
}

export function localGetState(): AppStateResponse {
  const db = getLocalDB();
  return {
    tables: db.tables,
    menu: db.menu,
    categories: db.categories,
    settings: db.settings,
    orders: db.orders,
    waiters: db.waiters,
    users: db.users,
  };
}

export function localCreateOrder(data: {
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
}): { message: string; order: Order } {
  const db = getLocalDB();
  const table = db.tables.find(t => t.id === data.tableId);
  if (!table) throw new Error('Mesa no encontrada');

  db.orderCounter += 1;
  const orderNumber = db.orderCounter;
  const orderId = 'ord_' + Date.now();
  const batchId = 'batch_' + Date.now();
  const now = new Date().toISOString();

  const orderItems = data.items.map((item, idx) => ({
    id: `${orderId}_i${idx + 1}`,
    menuItemId: item.menuItemId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    notes: item.notes || '',
    round: 1,
    addedAt: now,
  }));

  const initialBatch = {
    id: batchId,
    orderId,
    orderNumber,
    tableId: data.tableId,
    tableName: table.name,
    waiterName: data.waiterName || 'Mesonero',
    round: 1,
    isAddition: false,
    items: orderItems,
    createdAt: now,
    status: 'pendiente' as KitchenBatchStatus,
  };

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    tableId: data.tableId,
    tableName: table.name,
    waiterName: data.waiterName || 'Mesonero',
    customerCount: data.customerCount || 1,
    status: 'abierta',
    items: orderItems,
    subtotal: 0,
    taxPercent: db.settings.taxPercent,
    taxAmount: 0,
    tipPercent: db.settings.defaultTipPercent,
    tipAmount: 0,
    discountAmount: 0,
    total: 0,
    batches: [initialBatch],
    createdAt: now,
    updatedAt: now,
  };

  calculateOrderTotals(newOrder, db.settings.taxPercent);

  table.status = 'ocupada';
  table.activeOrderId = orderId;

  db.orders.unshift(newOrder);
  saveLocalDB(db);

  return { message: 'Pedido creado exitosamente y enviado a cocina', order: newOrder };
}

export function localAddOrderItems(orderId: string, data: {
  waiterName?: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
}): { message: string; order: Order } {
  const db = getLocalDB();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new Error('Pedido no encontrado');

  const now = new Date().toISOString();
  const currentRounds = order.batches.map(b => b.round);
  const nextRound = (currentRounds.length > 0 ? Math.max(...currentRounds) : 1) + 1;

  const newItems = data.items.map((item, idx) => ({
    id: `${order.id}_r${nextRound}_i${idx + 1}`,
    menuItemId: item.menuItemId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    notes: item.notes || '',
    round: nextRound,
    addedAt: now,
  }));

  const newBatch = {
    id: 'batch_' + Date.now(),
    orderId: order.id,
    orderNumber: order.orderNumber,
    tableId: order.tableId,
    tableName: order.tableName,
    waiterName: data.waiterName || order.waiterName,
    round: nextRound,
    isAddition: true,
    items: newItems,
    createdAt: now,
    status: 'pendiente' as KitchenBatchStatus,
  };

  order.items.push(...newItems);
  order.batches.push(newBatch);
  order.updatedAt = now;
  calculateOrderTotals(order, db.settings.taxPercent);

  saveLocalDB(db);
  return { message: 'Adición agregada con éxito y enviada a cocina', order };
}

export function localUpdateBatchStatus(batchId: string, status?: string, markPrinted?: boolean) {
  const db = getLocalDB();
  for (const order of db.orders) {
    const batch = order.batches.find(b => b.id === batchId);
    if (batch) {
      if (status) batch.status = status as KitchenBatchStatus;
      if (markPrinted) batch.printedAt = new Date().toISOString();
      saveLocalDB(db);
      return { message: 'Estado de comanda actualizado', batch, order };
    }
  }
  throw new Error('Comanda de cocina no encontrada');
}

export function localRequestBill(orderId: string) {
  const db = getLocalDB();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new Error('Pedido no encontrado');

  order.status = 'cuenta_solicitada';
  order.updatedAt = new Date().toISOString();
  const table = db.tables.find(t => t.id === order.tableId);
  if (table) table.status = 'cuenta_solicitada';

  saveLocalDB(db);
  return { message: 'Cuenta solicitada para la mesa', order };
}

export function localPayOrder(orderId: string, payload: {
  paymentMethod?: string;
  paymentReference?: string;
  tipPercent?: number;
  tipAmount?: number;
  discountAmount?: number;
}) {
  const db = getLocalDB();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new Error('Pedido no encontrado');

  const now = new Date().toISOString();
  order.status = 'pagada';
  order.paidAt = now;
  order.paymentMethod = (payload.paymentMethod as any) || 'efectivo';
  order.paymentReference = payload.paymentReference || '';

  if (typeof payload.tipPercent === 'number') order.tipPercent = payload.tipPercent;
  if (typeof payload.tipAmount === 'number') order.tipAmount = payload.tipAmount;
  if (typeof payload.discountAmount === 'number') order.discountAmount = payload.discountAmount;

  calculateOrderTotals(order, db.settings.taxPercent);

  const table = db.tables.find(t => t.id === order.tableId);
  if (table) {
    table.status = 'libre';
    table.activeOrderId = undefined;
  }

  saveLocalDB(db);

  // Send to Google Sheets webhook if configured
  if (db.settings.googleSheetsWebhookUrl) {
    const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name} ($${i.price})`).join('; ');
    dispatchGoogleWebhook(db.settings.googleSheetsWebhookUrl, {
      action: 'ADD_ORDER',
      orderNumber: order.orderNumber,
      tableName: order.tableName,
      waiterName: order.waiterName,
      customerCount: order.customerCount,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      tipAmount: order.tipAmount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference || '',
      items: itemsSummary,
      itemCount: order.items.reduce((a, b) => a + b.quantity, 0),
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    });
  }

  return { message: 'Pedido cobrado y mesa liberada', order };
}

export function localCancelOrder(orderId: string) {
  const db = getLocalDB();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new Error('Pedido no encontrado');

  order.status = 'cancelada';
  order.updatedAt = new Date().toISOString();
  const table = db.tables.find(t => t.id === order.tableId);
  if (table) {
    table.status = 'libre';
    table.activeOrderId = undefined;
  }

  saveLocalDB(db);
  return { message: 'Pedido cancelado', order };
}

export function localUpdateSettings(settings: Partial<RestaurantSettings>) {
  const db = getLocalDB();
  db.settings = { ...db.settings, ...settings };
  saveLocalDB(db);
  return { message: 'Configuración actualizada', settings: db.settings };
}

export function localResetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  return { message: 'Datos reiniciados' };
}

export function localCreateUser(data: { name: string; role: UserRole; pin?: string; active?: boolean }) {
  const db = getLocalDB();
  const maxId = db.users.reduce((max, u) => (u.id > max ? u.id : max), 0);
  const newUser: AppUser = {
    id: maxId + 1,
    name: data.name.trim(),
    role: data.role,
    pin: data.pin?.trim() || '',
    active: data.active ?? true,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveLocalDB(db);
  return { message: 'Usuario creado', user: newUser };
}

export function localUpdateUser(id: number, data: Partial<AppUser>) {
  const db = getLocalDB();
  const user = db.users.find(u => u.id === id);
  if (!user) throw new Error('Usuario no encontrado');
  Object.assign(user, data);
  saveLocalDB(db);
  return { message: 'Usuario actualizado', user };
}

export function localDeleteUser(id: number) {
  const db = getLocalDB();
  db.users = db.users.filter(u => u.id !== id);
  saveLocalDB(db);
  return { message: 'Usuario eliminado', id };
}

export async function localTestWebhook(url?: string) {
  const db = getLocalDB();
  const webhookUrl = url || db.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) throw new Error('Debe configurar la URL del Webhook de Google Sheets');

  const testPayload = {
    action: 'ADD_ORDER',
    orderNumber: '#TEST-' + Math.floor(100 + Math.random() * 900),
    tableName: 'Mesa 1 (Prueba)',
    waiterName: 'Mesonero Demo',
    customerCount: 2,
    subtotal: 10.00,
    taxAmount: 1.60,
    tipAmount: 1.00,
    total: 12.60,
    paymentMethod: 'Pago Móvil (Prueba)',
    paymentReference: 'REF-' + Date.now().toString().slice(-4),
    items: '1x Hamburguesa Doble Queso ($8.50); 1x Coca-Cola ($1.50)',
    itemCount: 2,
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
  };

  await dispatchGoogleWebhook(webhookUrl, testPayload);
  return { success: true, message: '¡Prueba enviada! Revisa tu Google Sheet en la pestaña "Ventas".' };
}

export async function localSyncUsers(url?: string) {
  const db = getLocalDB();
  const webhookUrl = url || db.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) throw new Error('Debe configurar la URL del Webhook de Google Sheets');

  await dispatchGoogleWebhook(webhookUrl, {
    action: 'SYNC_USERS',
    timestamp: new Date().toISOString(),
    users: db.users,
  });

  return { success: true, message: `¡Se enviaron ${db.users.length} usuarios a la hoja "Usuario" de tu Google Sheet!` };
}

export async function localSyncAllOrders(url?: string) {
  const db = getLocalDB();
  const webhookUrl = url || db.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) throw new Error('Debe configurar la URL del Webhook de Google Sheets');

  const paidOrders = db.orders.filter(o => o.status === 'pagada');
  const rows = paidOrders.map(order => ({
    orderNumber: order.orderNumber,
    tableName: order.tableName,
    waiterName: order.waiterName,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    tipAmount: order.tipAmount,
    total: order.total,
    paymentMethod: order.paymentMethod,
    items: order.items.map(i => `${i.quantity}x ${i.name}`).join(' | '),
    paidAt: order.paidAt,
  }));

  await dispatchGoogleWebhook(webhookUrl, {
    action: 'SYNC_ALL',
    timestamp: new Date().toISOString(),
    restaurant: db.settings.restaurantName,
    orders: rows,
  });

  db.settings.googleSheetsLastSync = new Date().toISOString();
  saveLocalDB(db);
  return { success: true, message: `Sincronizados ${paidOrders.length} pedidos con Google Sheets.` };
}

export function localCreateMenuItem(data: Partial<MenuItem>): { message: string; item: MenuItem } {
  const db = getLocalDB();
  const newItem: MenuItem = {
    id: `m_${Date.now()}`,
    name: data.name || 'Nuevo Plato',
    category: data.category || 'Otros',
    price: Number(data.price) || 0,
    description: data.description || '',
    quickNotes: Array.isArray(data.quickNotes) ? data.quickNotes : [],
    available: data.available !== false,
  };
  db.menu.push(newItem);
  if (!db.categories.includes(newItem.category)) {
    db.categories.push(newItem.category);
  }
  saveLocalDB(db);

  if (db.settings.googleSheetsWebhookUrl) {
    localSyncMenu().catch(() => {});
  }

  return { message: 'Plato agregado al menú', item: newItem };
}

export function localUpdateMenuItem(id: string, data: Partial<MenuItem>): { message: string; item: MenuItem } {
  const db = getLocalDB();
  const item = db.menu.find(m => m.id === id);
  if (!item) throw new Error('Plato no encontrado');

  if (data.name !== undefined) item.name = data.name;
  if (data.category !== undefined) {
    item.category = data.category;
    if (!db.categories.includes(item.category)) {
      db.categories.push(item.category);
    }
  }
  if (data.price !== undefined) item.price = Number(data.price) || 0;
  if (data.description !== undefined) item.description = data.description;
  if (data.quickNotes !== undefined) item.quickNotes = data.quickNotes;
  if (data.available !== undefined) item.available = Boolean(data.available);

  saveLocalDB(db);

  if (db.settings.googleSheetsWebhookUrl) {
    localSyncMenu().catch(() => {});
  }

  return { message: 'Plato actualizado', item };
}

export function localDeleteMenuItem(id: string): { message: string; item: MenuItem } {
  const db = getLocalDB();
  const index = db.menu.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Plato no encontrado');

  const deleted = db.menu.splice(index, 1)[0];
  saveLocalDB(db);

  if (db.settings.googleSheetsWebhookUrl) {
    localSyncMenu().catch(() => {});
  }

  return { message: 'Plato eliminado del menú', item: deleted };
}

export function localCreateTable(data: { name: string; capacity: number; zone?: string }): { message: string; table: Table } {
  const db = getLocalDB();
  const newTable: Table = {
    id: `t_${Date.now()}`,
    name: data.name,
    capacity: Number(data.capacity) || 4,
    status: 'libre',
    zone: data.zone || 'Salón Principal',
  };
  db.tables.push(newTable);
  saveLocalDB(db);
  return { message: 'Mesa creada con éxito', table: newTable };
}

export function localUpdateTable(id: string, data: Partial<Table>): { message: string; table: Table } {
  const db = getLocalDB();
  const table = db.tables.find(t => t.id === id);
  if (!table) throw new Error('Mesa no encontrada');

  if (data.name !== undefined) table.name = data.name;
  if (data.capacity !== undefined) table.capacity = Number(data.capacity) || 4;
  if (data.zone !== undefined) table.zone = data.zone;

  saveLocalDB(db);
  return { message: 'Mesa actualizada', table };
}

export function localDeleteTable(id: string): { message: string; table: Table } {
  const db = getLocalDB();
  const index = db.tables.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Mesa no encontrada');

  const deleted = db.tables.splice(index, 1)[0];
  saveLocalDB(db);
  return { message: 'Mesa eliminada', table: deleted };
}

export async function localSyncMenu(url?: string) {
  const db = getLocalDB();
  const webhookUrl = url || db.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) throw new Error('Debe configurar la URL del Webhook de Google Sheets');

  await dispatchGoogleWebhook(webhookUrl, {
    action: 'SYNC_MENU',
    timestamp: new Date().toISOString(),
    restaurant: db.settings.restaurantName,
    menu: db.menu,
  });

  return { success: true, message: `¡Se enviaron ${db.menu.length} platos a la pestaña "Platos" de tu Google Sheet!` };
}

export async function localSyncTables(url?: string) {
  const db = getLocalDB();
  const webhookUrl = url || db.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) throw new Error('Debe configurar la URL del Webhook de Google Sheets');

  const tableData = db.tables.map(t => {
    const activeOrder = db.orders.find(o => o.tableId === t.id && o.status !== 'pagada' && o.status !== 'cancelada');
    return {
      id: t.id,
      name: t.name,
      capacity: t.capacity,
      zone: t.zone || 'Principal',
      status: t.status,
      activeOrderNumber: activeOrder ? `#${activeOrder.orderNumber}` : 'Ninguno',
      waiterName: activeOrder ? activeOrder.waiterName : 'N/A',
      total: activeOrder ? activeOrder.total : 0,
      itemCount: activeOrder ? activeOrder.items.length : 0,
    };
  });

  await dispatchGoogleWebhook(webhookUrl, {
    action: 'SYNC_TABLES',
    timestamp: new Date().toISOString(),
    restaurant: db.settings.restaurantName,
    tables: tableData,
  });

  return { success: true, message: `¡Se enviaron ${db.tables.length} mesas a la pestaña "Mesas" de tu Google Sheet!` };
}

export async function localSyncUrl(url?: string, bcvRate?: number) {
  const db = getLocalDB();
  const webhookUrl = url || db.settings.googleSheetsWebhookUrl;
  const rate = bcvRate !== undefined ? bcvRate : db.settings.bcvRate;
  if (!webhookUrl) throw new Error('Debe configurar la URL del Webhook de Google Sheets');

  await dispatchGoogleWebhook(webhookUrl, {
    action: 'SYNC_URL',
    timestamp: new Date().toISOString(),
    restaurant: db.settings.restaurantName,
    url: webhookUrl,
    bcvRate: rate,
    currencySymbol: db.settings.currencySymbol || '$',
    currencyBs: db.settings.currencyBs || 'Bs.',
    bcvLastUpdated: db.settings.bcvLastUpdated || new Date().toISOString(),
  });

  return { success: true, message: `¡URL y Tasa BCV (Bs. ${rate.toFixed(2)}) registradas en la pestaña "URL" de tu Google Sheet!` };
}

export function syncLocalDBWithServerState(serverState: AppStateResponse) {
  try {
    const db = getLocalDB();
    if (serverState.settings) {
      db.settings = { ...db.settings, ...serverState.settings };
    }
    if (serverState.menu && serverState.menu.length > 0) {
      db.menu = serverState.menu;
    }
    if (serverState.tables && serverState.tables.length > 0) {
      db.tables = serverState.tables;
    }
    if (serverState.users && serverState.users.length > 0) {
      db.users = serverState.users;
    }
    if (serverState.orders) {
      db.orders = serverState.orders;
    }
    saveLocalDB(db);
  } catch (e) {
    console.warn('Could not sync localDB with server state', e);
  }
}
