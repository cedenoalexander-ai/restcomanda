import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent store file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'restaurant_data.json');

// Initial sample state
const INITIAL_CATEGORIES = [
  'Entradas',
  'Hamburguesas',
  'Platos Fuertes',
  'Pizzas',
  'Bebidas',
  'Cócteles',
  'Postres'
];

const INITIAL_MENU = [
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
    quickNotes: ['Término medio', 'Bien cocido', 'Yuca sancochada', 'Papas fritas en vez de yuca'],
    available: true,
  },
  {
    id: 'm8',
    name: 'Churrasco de Solomo 350g',
    category: 'Platos Fuertes',
    price: 16.0,
    description: 'Corte magro a la brasa con mantequilla de hierbas finas y papas rústicas.',
    quickNotes: ['Término 1/4', 'Término medio', '3/4', 'Bien cocido'],
    available: true,
  },
  {
    id: 'm9',
    name: 'Pechuga Cordon Bleu Gourmet',
    category: 'Platos Fuertes',
    price: 14.0,
    description: 'Pechuga rellena de jamón ahumado y queso fundido, bañada en salsa de champiñones con puré.',
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
    description: 'Clásica con pomodoro, queso mozzarella fresco, albahaca genovesa y aceite de oliva virgen extra.',
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
    name: 'Jugo Natural de Frutas (Maracuyá/Fresa)',
    category: 'Bebidas',
    price: 3.5,
    description: 'Frutas naturales frescas de temporada en agua o leche.',
    quickNotes: ['En agua', 'En leche', 'Sin azúcar', 'Poca azúcar', 'Con hielo'],
    available: true,
  },
  {
    id: 'm14',
    name: 'Refresco Línea 355ml',
    category: 'Bebidas',
    price: 2.0,
    description: 'Coca-Cola, Pepsi, 7Up, Colita o Agua Mineral con gas.',
    quickNotes: ['Con hielo y limón', 'Sin hielo'],
    available: true,
  },
  {
    id: 'm15',
    name: 'Mojito Cubano de Menta Fresca',
    category: 'Cócteles',
    price: 6.0,
    description: 'Ron blanco añejo, hierbabuena fresca machacada, jugo de lima, azúcar de caña y soda.',
    quickNotes: ['Poco dulce', 'Fuerte de ron', 'Sin azúcar'],
    available: true,
  },
  {
    id: 'm16',
    name: 'Margarita Clásica Coronada',
    category: 'Cócteles',
    price: 6.5,
    description: 'Tequila reposado, licor triple sec de naranja, jugo de lima y copa escarchada con sal marina.',
    quickNotes: ['Escarchada con sal', 'Escarchada con tajín'],
    available: true,
  },
  {
    id: 'm17',
    name: 'Brownie Tibio con Helado de Vainilla',
    category: 'Postres',
    price: 5.5,
    description: 'Brownie húmedo de chocolate oscuro con nueces, bola de helado artesanal y sirope de chocolate.',
    quickNotes: ['Helado aparte', 'Sin nueces'],
    available: true,
  },
  {
    id: 'm18',
    name: 'Torta Tres Leches Tradicional',
    category: 'Postres',
    price: 4.8,
    description: 'Bizcocho esponjoso bañado en tres leches con merengue suizo flameado y canela.',
    quickNotes: ['Con canela extra', 'Para compartir'],
    available: true,
  }
];

type TableStatus = 'libre' | 'ocupada' | 'cuenta_solicitada';

interface TableItem {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  activeOrderId?: string;
  zone?: string;
}

interface WaiterItem {
  id: string;
  name: string;
  code?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

const INITIAL_WAITERS: WaiterItem[] = [
  { id: 'w1', name: 'Carlos Mendoza', code: '101', phone: '+58 412-1234567', active: true, createdAt: new Date().toISOString() },
  { id: 'w2', name: 'María González', code: '102', phone: '+58 414-7654321', active: true, createdAt: new Date().toISOString() },
  { id: 'w3', name: 'Alejandro Silva', code: '103', phone: '+58 416-5558899', active: true, createdAt: new Date().toISOString() },
  { id: 'w4', name: 'Andrea Pérez', code: '104', phone: '+58 424-9988776', active: true, createdAt: new Date().toISOString() },
];

const INITIAL_TABLES: TableItem[] = [
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

export type UserRole = 'admin' | 'mesonero' | 'cocina';

export interface AppUserItem {
  id: number; // Id Usuario correlativo automático
  name: string; // Nombre del usuario
  role: UserRole; // 'admin' | 'mesonero' | 'cocina'
  pin?: string;
  active: boolean;
  createdAt: string;
}

const INITIAL_USERS: AppUserItem[] = [
  { id: 1, name: 'Administrador Principal', role: 'admin', pin: '1234', active: true, createdAt: new Date().toISOString() },
  { id: 2, name: 'Carlos Mendoza', role: 'mesonero', pin: '1111', active: true, createdAt: new Date().toISOString() },
  { id: 3, name: 'María González', role: 'mesonero', pin: '2222', active: true, createdAt: new Date().toISOString() },
  { id: 4, name: 'Chef Mario (Cocina)', role: 'cocina', pin: '3333', active: true, createdAt: new Date().toISOString() },
];

const INITIAL_SETTINGS = {
  restaurantName: 'Restaurante & Grill El Portal',
  currencySymbol: '$',
  currencyCode: 'USD',
  currencyBs: 'Bs.',
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

// Database structure
interface DBState {
  orderCounter: number;
  tables: TableItem[];
  menu: typeof INITIAL_MENU;
  categories: string[];
  settings: typeof INITIAL_SETTINGS;
  orders: any[];
  waiters: WaiterItem[];
  users: AppUserItem[];
}

let dbState: DBState = {
  orderCounter: 100,
  tables: INITIAL_TABLES,
  menu: INITIAL_MENU,
  categories: INITIAL_CATEGORIES,
  settings: INITIAL_SETTINGS,
  orders: [],
  waiters: INITIAL_WAITERS,
  users: INITIAL_USERS,
};

// Load saved data if available
function loadState() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      dbState = {
        ...dbState,
        ...loaded,
        // Ensure arrays and defaults exist
        tables: loaded.tables || INITIAL_TABLES,
        menu: loaded.menu || INITIAL_MENU,
        categories: loaded.categories || INITIAL_CATEGORIES,
        settings: { ...INITIAL_SETTINGS, ...(loaded.settings || {}) },
        orders: loaded.orders || [],
        orderCounter: loaded.orderCounter || 100,
        waiters: loaded.waiters || INITIAL_WAITERS,
        users: (loaded.users && loaded.users.length > 0) ? loaded.users : INITIAL_USERS,
      };
      console.log(`[Store] Loaded ${dbState.orders.length} orders, ${dbState.tables.length} tables, ${dbState.users.length} users from ${DATA_FILE}`);
    } else {
      saveState();
    }
  } catch (err) {
    console.error('[Store] Error loading state from disk:', err);
  }
}

function saveState() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Error saving state to disk:', err);
  }
}

loadState();

// Utility calculation for order totals
function calculateOrderTotals(order: any, taxPercent: number) {
  const subtotal = order.items.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
  const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
  const tipAmount = order.tipPercent ? Number(((subtotal * order.tipPercent) / 100).toFixed(2)) : (order.tipAmount || 0);
  const discountAmount = order.discountAmount || 0;
  const total = Number((subtotal + taxAmount + tipAmount - discountAmount).toFixed(2));

  order.subtotal = Number(subtotal.toFixed(2));
  order.taxPercent = taxPercent;
  order.taxAmount = taxAmount;
  order.tipAmount = tipAmount;
  order.total = total;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Full state for sync
app.get('/api/state', (req, res) => {
  res.json({
    tables: dbState.tables,
    orders: dbState.orders,
    menu: dbState.menu,
    categories: dbState.categories,
    settings: dbState.settings,
    waiters: dbState.waiters,
    users: dbState.users,
    serverTime: new Date().toISOString(),
  });
});

// Create a new order for a table
app.post('/api/orders', (req, res) => {
  const { tableId, waiterName, customerCount, items } = req.body;

  const table = dbState.tables.find(t => t.id === tableId);
  if (!table) {
    return res.status(404).json({ error: 'Mesa no encontrada' });
  }

  // Check if table already has an active order
  const existingOrder = dbState.orders.find(o => o.tableId === tableId && o.status !== 'pagada' && o.status !== 'cancelada');
  if (existingOrder) {
    return res.status(400).json({
      error: `La mesa ya tiene un pedido activo (#${existingOrder.orderNumber}). Utilice la opción de agregar adicionales.`
    });
  }

  if (!items || !items.length) {
    return res.status(400).json({ error: 'El pedido debe incluir al menos un plato o bebida' });
  }

  dbState.orderCounter += 1;
  const orderNumber = dbState.orderCounter;
  const now = new Date().toISOString();
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Prepare items for Round 1
  const orderItems = items.map((it: any, index: number) => ({
    id: `item_${orderId}_1_${index}`,
    menuItemId: it.menuItemId,
    name: it.name,
    price: Number(it.price) || 0,
    quantity: Number(it.quantity) || 1,
    notes: it.notes ? it.notes.trim() : '',
    round: 1,
    addedAt: now,
  }));

  // Create initial kitchen batch
  const batchId = `batch_${orderId}_1`;
  const initialBatch = {
    id: batchId,
    orderId,
    orderNumber,
    tableId: table.id,
    tableName: table.name,
    waiterName: waiterName || 'Mesonero',
    round: 1,
    isAddition: false,
    items: orderItems,
    createdAt: now,
    status: 'pendiente' as const,
  };

  const newOrder = {
    id: orderId,
    orderNumber,
    tableId: table.id,
    tableName: table.name,
    waiterName: waiterName || 'Mesonero',
    customerCount: Number(customerCount) || 1,
    status: 'abierta' as const,
    createdAt: now,
    updatedAt: now,
    items: orderItems,
    batches: [initialBatch],
    subtotal: 0,
    taxPercent: dbState.settings.taxPercent,
    taxAmount: 0,
    tipPercent: 0,
    tipAmount: 0,
    discountAmount: 0,
    total: 0,
  };

  calculateOrderTotals(newOrder, dbState.settings.taxPercent);

  // Update table status
  table.status = 'ocupada';
  table.activeOrderId = orderId;

  // Insert order
  dbState.orders.unshift(newOrder);
  saveState();

  res.status(201).json({
    message: 'Pedido enviado a cocina exitosamente',
    order: newOrder,
    batch: initialBatch,
  });
});

// Add additional items to an existing order (Pedir algo adicional)
app.post('/api/orders/:id/items', (req, res) => {
  const { id } = req.params;
  const { items, waiterName } = req.body;

  const order = dbState.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  if (order.status === 'pagada' || order.status === 'cancelada') {
    return res.status(400).json({ error: 'No se pueden agregar productos a un pedido cerrado o cancelado' });
  }

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Debe especificar al menos un producto para agregar' });
  }

  const now = new Date().toISOString();
  const nextRound = (order.batches?.length || 0) + 1;
  const batchId = `batch_${order.id}_${nextRound}`;

  const additionalItems = items.map((it: any, index: number) => ({
    id: `item_${order.id}_${nextRound}_${index}`,
    menuItemId: it.menuItemId,
    name: it.name,
    price: Number(it.price) || 0,
    quantity: Number(it.quantity) || 1,
    notes: it.notes ? it.notes.trim() : '',
    round: nextRound,
    addedAt: now,
  }));

  const newBatch = {
    id: batchId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    tableId: order.tableId,
    tableName: order.tableName,
    waiterName: waiterName || order.waiterName,
    round: nextRound,
    isAddition: true, // Clearly marked as an addition!
    items: additionalItems,
    createdAt: now,
    status: 'pendiente' as const,
  };

  order.items.push(...additionalItems);
  order.batches.push(newBatch);
  order.updatedAt = now;
  if (waiterName) order.waiterName = waiterName;

  calculateOrderTotals(order, dbState.settings.taxPercent);
  saveState();

  res.json({
    message: `Ronda #${nextRound} (Adicional) enviada a cocina`,
    order,
    batch: newBatch,
  });
});

// Update kitchen batch status (pendiente -> en_preparacion -> listo -> entregado) or mark printed
app.patch('/api/batches/:batchId/status', (req, res) => {
  const { batchId } = req.params;
  const { status, markPrinted } = req.body;

  let foundBatch: any = null;
  let parentOrder: any = null;

  for (const ord of dbState.orders) {
    const b = ord.batches?.find((batch: any) => batch.id === batchId);
    if (b) {
      foundBatch = b;
      parentOrder = ord;
      break;
    }
  }

  if (!foundBatch) {
    return res.status(404).json({ error: 'Comanda de cocina no encontrada' });
  }

  if (status) {
    foundBatch.status = status;
  }

  if (markPrinted) {
    foundBatch.printedAt = new Date().toISOString();
  }

  saveState();

  res.json({
    message: 'Estado de comanda actualizado',
    batch: foundBatch,
    order: parentOrder,
  });
});

// Request bill for a table (cambiar estado a cuenta solicitada)
app.post('/api/orders/:id/request-bill', (req, res) => {
  const { id } = req.params;
  const order = dbState.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'cuenta_solicitada';
  order.updatedAt = new Date().toISOString();

  const table = dbState.tables.find(t => t.id === order.tableId);
  if (table) {
    table.status = 'cuenta_solicitada';
  }

  saveState();
  res.json({ message: 'Cuenta solicitada para la mesa', order });
});

// Pay and close order (cierre de pedido y liberación de mesa)
app.post('/api/orders/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paymentReference, tipPercent, tipAmount, discountAmount } = req.body;

  const order = dbState.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  if (order.status === 'pagada') {
    return res.status(400).json({ error: 'Este pedido ya fue cobrado previamente' });
  }

  const now = new Date().toISOString();
  order.status = 'pagada';
  order.paidAt = now;
  order.paymentMethod = paymentMethod || 'efectivo';
  order.paymentReference = paymentReference || '';

  if (typeof tipPercent === 'number') order.tipPercent = tipPercent;
  if (typeof tipAmount === 'number') order.tipAmount = tipAmount;
  if (typeof discountAmount === 'number') order.discountAmount = discountAmount;

  calculateOrderTotals(order, dbState.settings.taxPercent);

  // Free up table
  const table = dbState.tables.find(t => t.id === order.tableId);
  if (table) {
    table.status = 'libre';
    table.activeOrderId = undefined;
  }

  saveState();

  // Try to sync with Google Sheets webhook if configured
  if (dbState.settings.googleSheetsWebhookUrl) {
    try {
      syncOrderToGoogleSheets(order, dbState.settings.googleSheetsWebhookUrl);
      order.syncedToSheets = true;
    } catch (e) {
      console.warn('[Google Sheets] Webhook trigger warning:', e);
    }
  }

  res.json({
    message: 'Pedido pagado exitosamente y mesa liberada',
    order,
  });
});

// Cancel active order
app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const order = dbState.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.status = 'cancelada';
  order.updatedAt = new Date().toISOString();

  const table = dbState.tables.find(t => t.id === order.tableId);
  if (table) {
    table.status = 'libre';
    table.activeOrderId = undefined;
  }

  saveState();
  res.json({ message: 'Pedido cancelado', order });
});

// Function to send data to Google Sheets Webhook (Google Apps Script Web App)
async function syncOrderToGoogleSheets(order: any, webhookUrl: string) {
  try {
    const itemsSummary = order.items.map((i: any) => `${i.quantity}x ${i.name} ($${i.price})`).join('; ');
    const payload = {
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
      itemCount: order.items.reduce((a: number, b: any) => a + b.quantity, 0),
      createdAt: order.createdAt,
      paidAt: order.paidAt || new Date().toISOString(),
    };

    const fetchRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log(`[Google Sheets] Webhook response status: ${fetchRes.status}`);
  } catch (err: any) {
    console.error('[Google Sheets] Error posting to webhook:', err.message);
  }
}

// Manual trigger to sync all paid orders to Google Sheets or test connection
app.post('/api/sheets/sync', async (req, res) => {
  const webhookUrl = req.body.webhookUrl || dbState.settings.googleSheetsWebhookUrl;

  if (!webhookUrl) {
    return res.status(400).json({
      error: 'Debe configurar la URL del Webhook de Google Sheets (Apps Script Web App).'
    });
  }

  try {
    const paidOrders = dbState.orders.filter(o => o.status === 'pagada');
    const rows = paidOrders.map(order => ({
      orderNumber: order.orderNumber,
      tableName: order.tableName,
      waiterName: order.waiterName,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      tipAmount: order.tipAmount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' | '),
      paidAt: order.paidAt,
    }));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SYNC_ALL',
        timestamp: new Date().toISOString(),
        restaurant: dbState.settings.restaurantName,
        orders: rows,
      }),
    });

    dbState.settings.googleSheetsLastSync = new Date().toISOString();
    saveState();

    res.json({
      success: true,
      message: `Sincronizados ${paidOrders.length} pedidos con Google Sheets`,
      httpStatus: response.status,
      timestamp: dbState.settings.googleSheetsLastSync,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Error al conectar con Google Sheets Webhook: ${err.message}`,
    });
  }
});

// Enviar fila de prueba inmediata a Google Sheets
app.post('/api/sheets/test', async (req, res) => {
  const webhookUrl = req.body.webhookUrl || dbState.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) {
    return res.status(400).json({ error: 'Debe ingresar o guardar la URL del Webhook de Google Sheets' });
  }

  try {
    const testOrder = {
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

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrder),
    });

    res.json({
      success: true,
      message: '¡Prueba enviada con éxito! Revisa tu Google Sheet en la hoja "Ventas", deberías ver la fila de prueba recién agregada.',
      httpStatus: response.status,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Error al conectar con Google Sheets: ${err.message}. Asegúrate de que la implementación en Apps Script esté configurada con acceso para "Cualquiera" (Anyone).`,
    });
  }
});

// Enviar sincronización de usuarios a la pestaña "Usuario" de Google Sheets
app.post('/api/sheets/sync-users', async (req, res) => {
  const webhookUrl = req.body.webhookUrl || dbState.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) {
    return res.status(400).json({ error: 'Debe ingresar o guardar la URL del Webhook de Google Sheets' });
  }

  try {
    const payload = {
      action: 'SYNC_USERS',
      timestamp: new Date().toISOString(),
      users: dbState.users,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    res.json({
      success: true,
      message: `¡Se sincronizaron ${dbState.users.length} usuarios a la pestaña "Usuario" de tu Google Sheet!`,
      httpStatus: response.status,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Error al enviar usuarios a Google Sheets: ${err.message}`,
    });
  }
});

// Enviar sincronización de mesas y estado actual a la pestaña "Mesas" de Google Sheets
app.post('/api/sheets/sync-tables', async (req, res) => {
  const webhookUrl = req.body.webhookUrl || dbState.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) {
    return res.status(400).json({ error: 'Debe ingresar o guardar la URL del Webhook de Google Sheets' });
  }

  try {
    const tableData = dbState.tables.map((t) => {
      const activeOrder = dbState.orders.find(
        (o) => o.tableId === t.id && o.status !== 'pagada' && o.status !== 'cancelada'
      );
      return {
        id: t.id,
        name: t.name,
        capacity: t.capacity,
        zone: t.zone || 'Salón Principal',
        status: t.status,
        activeOrderNumber: activeOrder ? `#${activeOrder.orderNumber}` : 'Ninguno',
        waiterName: activeOrder ? activeOrder.waiterName : 'N/A',
        total: activeOrder ? activeOrder.total : 0,
        itemCount: activeOrder ? activeOrder.items.length : 0,
      };
    });

    const payload = {
      action: 'SYNC_TABLES',
      timestamp: new Date().toISOString(),
      restaurant: dbState.settings.restaurantName,
      tables: tableData,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    res.json({
      success: true,
      message: `¡Se sincronizaron ${dbState.tables.length} mesas a la pestaña "Mesas" de tu Google Sheet!`,
      httpStatus: response.status,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Error al sincronizar mesas con Google Sheets: ${err.message}`,
    });
  }
});

// Enviar sincronización de platos y menú a la pestaña "Platos" de Google Sheets
app.post('/api/sheets/sync-menu', async (req, res) => {
  const webhookUrl = req.body.webhookUrl || dbState.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) {
    return res.status(400).json({ error: 'Debe ingresar o guardar la URL del Webhook de Google Sheets' });
  }

  try {
    const payload = {
      action: 'SYNC_MENU',
      timestamp: new Date().toISOString(),
      restaurant: dbState.settings.restaurantName,
      menu: dbState.menu,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    res.json({
      success: true,
      message: `¡Se sincronizaron ${dbState.menu.length} platos a la pestaña "Platos" de tu Google Sheet!`,
      httpStatus: response.status,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Error al sincronizar platos con Google Sheets: ${err.message}`,
    });
  }
});

// Guardar y registrar Webhook URL y Tasa BCV en la pestaña "URL" de Google Sheets
app.post('/api/sheets/sync-url', async (req, res) => {
  const webhookUrl = req.body.webhookUrl || dbState.settings.googleSheetsWebhookUrl;
  const bcvRate = req.body.bcvRate !== undefined ? Number(req.body.bcvRate) : dbState.settings.bcvRate;

  if (!webhookUrl) {
    return res.status(400).json({ error: 'Debe ingresar o guardar la URL del Webhook de Google Sheets' });
  }

  try {
    const payload = {
      action: 'SYNC_URL',
      timestamp: new Date().toISOString(),
      restaurant: dbState.settings.restaurantName,
      url: webhookUrl,
      bcvRate: bcvRate,
      currencySymbol: dbState.settings.currencySymbol || '$',
      currencyBs: dbState.settings.currencyBs || 'Bs.',
      bcvLastUpdated: dbState.settings.bcvLastUpdated || new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    res.json({
      success: true,
      message: `¡URL y Tasa BCV (Bs. ${bcvRate.toFixed(2)}) registradas en la pestaña "URL" de tu Google Sheet!`,
      httpStatus: response.status,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Error al registrar en la pestaña "URL" de Google Sheets: ${err.message}`,
    });
  }
});

// Consultar la tasa BCV registrada en la pestaña "URL" de Google Sheets
app.get('/api/sheets/get-bcv', async (req, res) => {
  const webhookUrl = (req.query.webhookUrl as string) || dbState.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) {
    return res.status(400).json({ error: 'Webhook URL no configurada' });
  }

  try {
    const fetchUrl = new URL(webhookUrl);
    fetchUrl.searchParams.set('action', 'GET_BCV');

    const response = await fetch(fetchUrl.toString(), {
      method: 'GET',
    });

    const data = await response.json();
    if (data.bcvRate && !isNaN(Number(data.bcvRate))) {
      const parsedRate = Number(data.bcvRate);
      dbState.settings.bcvRate = parsedRate;
      dbState.settings.bcvLastUpdated = new Date().toISOString();
      saveState();

      return res.json({
        success: true,
        bcvRate: parsedRate,
        message: `Tasa BCV sincronizada con éxito desde la pestaña "URL" de Google Sheets: Bs. ${parsedRate.toFixed(2)}`,
      });
    }

    res.json({
      success: false,
      message: 'No se encontró el parámetro TASA_BCV en la pestaña "URL" de Google Sheets',
      bcvRate: dbState.settings.bcvRate,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Error al consultar tasa BCV desde Google Sheets: ${err.message}`,
    });
  }
});

// Helpers to automatically sync menu and URL to Google Sheets in background
async function autoSyncMenuWithSheets() {
  const webhookUrl = dbState.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SYNC_MENU',
        timestamp: new Date().toISOString(),
        restaurant: dbState.settings.restaurantName,
        menu: dbState.menu,
      }),
    });
    console.log('[Google Sheets] Auto-synced menu to sheet "Platos"');
  } catch (err: any) {
    console.warn('[Google Sheets] autoSyncMenu error:', err.message);
  }
}

async function autoSyncUrlWithSheets() {
  const webhookUrl = dbState.settings.googleSheetsWebhookUrl;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SYNC_URL',
        timestamp: new Date().toISOString(),
        restaurant: dbState.settings.restaurantName,
        url: webhookUrl,
        bcvRate: dbState.settings.bcvRate,
        currencySymbol: dbState.settings.currencySymbol || '$',
        currencyBs: dbState.settings.currencyBs || 'Bs.',
        bcvLastUpdated: dbState.settings.bcvLastUpdated || new Date().toISOString(),
      }),
    });
    console.log(`[Google Sheets] Auto-synced URL & Tasa BCV (Bs. ${dbState.settings.bcvRate}) to sheet "URL"`);
  } catch (err: any) {
    console.warn('[Google Sheets] autoSyncUrl error:', err.message);
  }
}

// Export all orders to CSV formatted for Google Sheets import
app.get('/api/sheets/export-csv', (req, res) => {
  const headers = [
    'Numero_Pedido',
    'Mesa',
    'Mesonero',
    'Fecha_Creacion',
    'Fecha_Pago',
    'Estado',
    'Metodo_Pago',
    'Subtotal',
    'Impuesto',
    'Propina',
    'Total',
    'Detalle_Productos'
  ];

  const rows = dbState.orders.map(o => {
    const itemsText = o.items.map((i: any) => `${i.quantity}x ${i.name} ($${i.price})`).join(' | ').replace(/"/g, '""');
    return [
      o.orderNumber,
      `"${o.tableName}"`,
      `"${o.waiterName}"`,
      `"${o.createdAt}"`,
      `"${o.paidAt || ''}"`,
      `"${o.status}"`,
      `"${o.paymentMethod || ''}"`,
      o.subtotal,
      o.taxAmount,
      o.tipAmount,
      o.total,
      `"${itemsText}"`
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=comandas_restaurante_${Date.now()}.csv`);
  res.send(csv);
});

// Download standalone single-file HTML version of the app for direct GitHub Pages deployment
app.get('/api/download-html', (req, res) => {
  const htmlPath = path.join(process.cwd(), 'dist-html', 'index.html');
  if (fs.existsSync(htmlPath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="index.html"');
    return res.sendFile(htmlPath);
  }
  res.status(404).send('Archivo HTML compilado no encontrado.');
});

// Export users to CSV formatted specifically for Google Sheets sheet "Usuario"
app.get('/api/sheets/export-csv-users', (req, res) => {
  const headers = [
    'Id_Usuario',
    'Nombre_Usuario',
    'Rol',
    'PIN',
    'Estado',
    'Fecha_Creacion'
  ];

  const rows = dbState.users.map(u => [
    u.id,
    `"${u.name.replace(/"/g, '""')}"`,
    `"${u.role}"`,
    `"${u.pin || ''}"`,
    `"${u.active ? 'Activo' : 'Inactivo'}"`,
    `"${u.createdAt}"`
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=hoja_usuario_${Date.now()}.csv`);
  res.send(csv);
});

// Update settings
app.put('/api/settings', (req, res) => {
  const updates = req.body;
  if (updates.bcvRate !== undefined) {
    updates.bcvRate = Number(updates.bcvRate) || 1;
    updates.bcvLastUpdated = new Date().toISOString();
  }
  dbState.settings = {
    ...dbState.settings,
    ...updates,
  };
  saveState();

  if (updates.googleSheetsWebhookUrl || updates.bcvRate !== undefined) {
    autoSyncUrlWithSheets().catch(() => {});
  }

  res.json({ message: 'Configuración actualizada', settings: dbState.settings });
});

// -------------------------------------------------------------
// MENU MANAGEMENT (CRUD)
// -------------------------------------------------------------

app.post('/api/menu', (req, res) => {
  const { name, category, price, description, quickNotes, available } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }

  const cleanPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : Number(price);

  const newItem = {
    id: `m_${Date.now()}`,
    name: String(name).trim(),
    category: category || 'Platos Principales',
    price: isNaN(cleanPrice) ? 0 : cleanPrice,
    description: description || '',
    quickNotes: Array.isArray(quickNotes) ? quickNotes : [],
    available: available !== undefined ? Boolean(available) : true,
  };

  dbState.menu.push(newItem);
  if (!dbState.categories.includes(newItem.category)) {
    dbState.categories.push(newItem.category);
  }

  saveState();
  autoSyncMenuWithSheets().catch(() => {});
  res.status(201).json({ message: 'Plato agregado al menú', item: newItem });
});

app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const item = dbState.menu.find(m => m.id === id);
  if (!item) return res.status(404).json({ error: 'Plato no encontrado' });

  if (req.body.name !== undefined) item.name = String(req.body.name).trim();
  if (req.body.category !== undefined) {
    item.category = req.body.category;
    if (!dbState.categories.includes(item.category)) {
      dbState.categories.push(item.category);
    }
  }
  if (req.body.price !== undefined) {
    const cleanPrice = typeof req.body.price === 'string' ? parseFloat(req.body.price.replace(',', '.')) : Number(req.body.price);
    item.price = isNaN(cleanPrice) ? 0 : cleanPrice;
  }
  if (req.body.description !== undefined) item.description = req.body.description;
  if (req.body.quickNotes !== undefined) item.quickNotes = req.body.quickNotes;
  if (req.body.available !== undefined) item.available = Boolean(req.body.available);

  saveState();
  autoSyncMenuWithSheets().catch(() => {});
  res.json({ message: 'Plato actualizado', item });
});

app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const index = dbState.menu.findIndex(m => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'Plato no encontrado' });

  const deleted = dbState.menu.splice(index, 1)[0];
  saveState();
  autoSyncMenuWithSheets().catch(() => {});
  res.json({ message: 'Plato eliminado del menú', item: deleted });
});

// -------------------------------------------------------------
// TABLES MANAGEMENT (CRUD)
// -------------------------------------------------------------

app.post('/api/tables', (req, res) => {
  const { name, capacity, zone } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre de la mesa es requerido' });

  const newTable: TableItem = {
    id: `t_${Date.now()}`,
    name,
    capacity: Number(capacity) || 4,
    status: 'libre',
    zone: zone || 'Salón Principal',
  };

  dbState.tables.push(newTable);
  saveState();
  res.status(201).json({ message: 'Mesa creada con éxito', table: newTable });
});

app.put('/api/tables/:id', (req, res) => {
  const { id } = req.params;
  const table = dbState.tables.find(t => t.id === id);
  if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });

  if (req.body.name !== undefined) table.name = req.body.name;
  if (req.body.capacity !== undefined) table.capacity = Number(req.body.capacity) || 4;
  if (req.body.zone !== undefined) table.zone = req.body.zone;
  if (req.body.status !== undefined) table.status = req.body.status;

  saveState();
  res.json({ message: 'Mesa actualizada', table });
});

app.delete('/api/tables/:id', (req, res) => {
  const { id } = req.params;
  const table = dbState.tables.find(t => t.id === id);
  if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });

  if (table.status !== 'libre' || table.activeOrderId) {
    return res.status(400).json({
      error: 'No se puede eliminar una mesa ocupada o con pedido activo. Cierre o libere la cuenta primero.',
    });
  }

  dbState.tables = dbState.tables.filter(t => t.id !== id);
  saveState();
  res.json({ message: 'Mesa eliminada con éxito', id });
});

// -------------------------------------------------------------
// WAITERS MANAGEMENT (CRUD)
// -------------------------------------------------------------

app.get('/api/waiters', (req, res) => {
  res.json({ waiters: dbState.waiters });
});

app.post('/api/waiters', (req, res) => {
  const { name, code, phone, active } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del mesonero es obligatorio' });
  }

  const newWaiter: WaiterItem = {
    id: `w_${Date.now()}`,
    name: name.trim(),
    code: code ? code.trim() : `${100 + dbState.waiters.length + 1}`,
    phone: phone ? phone.trim() : '',
    active: active !== undefined ? Boolean(active) : true,
    createdAt: new Date().toISOString(),
  };

  dbState.waiters.push(newWaiter);
  saveState();
  res.status(201).json({ message: 'Mesonero registrado con éxito', waiter: newWaiter });
});

app.put('/api/waiters/:id', (req, res) => {
  const { id } = req.params;
  const waiter = dbState.waiters.find(w => w.id === id);
  if (!waiter) return res.status(404).json({ error: 'Mesonero no encontrado' });

  if (req.body.name !== undefined) waiter.name = req.body.name.trim();
  if (req.body.code !== undefined) waiter.code = req.body.code.trim();
  if (req.body.phone !== undefined) waiter.phone = req.body.phone.trim();
  if (req.body.active !== undefined) waiter.active = Boolean(req.body.active);

  saveState();
  res.json({ message: 'Mesonero modificado con éxito', waiter });
});

app.delete('/api/waiters/:id', (req, res) => {
  const { id } = req.params;
  const index = dbState.waiters.findIndex(w => w.id === id);
  if (index === -1) return res.status(404).json({ error: 'Mesonero no encontrado' });

  const deleted = dbState.waiters.splice(index, 1)[0];
  saveState();
  res.json({ message: 'Mesonero eliminado con éxito', waiter: deleted });
});

// -------------------------------------------------------------
// USERS MANAGEMENT (CRUD con correlativo numérico automático)
// -------------------------------------------------------------

app.get('/api/users', (req, res) => {
  res.json({ users: dbState.users });
});

app.post('/api/users', (req, res) => {
  const { name, role, pin, active } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'El nombre del usuario es obligatorio' });
  }

  // Correlativo numérico automático (Id Usuario)
  const nextId = dbState.users && dbState.users.length > 0
    ? Math.max(...dbState.users.map(u => Number(u.id) || 0)) + 1
    : 1;

  const validRole: UserRole = (role === 'admin' || role === 'cocina' || role === 'mesonero') ? role : 'mesonero';

  const newUser: AppUserItem = {
    id: nextId,
    name: name.trim(),
    role: validRole,
    pin: pin ? String(pin).trim() : '1234',
    active: active !== undefined ? Boolean(active) : true,
    createdAt: new Date().toISOString(),
  };

  dbState.users.push(newUser);

  // If role is mesonero, also keep in sync with waiters list if not present
  if (newUser.role === 'mesonero') {
    const existingWaiter = dbState.waiters.find(w => w.name.toLowerCase() === newUser.name.toLowerCase());
    if (!existingWaiter) {
      dbState.waiters.push({
        id: `w_${newUser.id}_${Date.now()}`,
        name: newUser.name,
        code: `${newUser.id}`,
        active: newUser.active,
        createdAt: newUser.createdAt,
      });
    }
  }

  saveState();
  res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
});

app.put('/api/users/:id', (req, res) => {
  const idNum = Number(req.params.id);
  const user = dbState.users.find(u => u.id === idNum);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (req.body.name !== undefined) user.name = req.body.name.trim();
  if (req.body.role !== undefined && (req.body.role === 'admin' || req.body.role === 'cocina' || req.body.role === 'mesonero')) {
    user.role = req.body.role;
  }
  if (req.body.pin !== undefined) user.pin = String(req.body.pin).trim();
  if (req.body.active !== undefined) user.active = Boolean(req.body.active);

  saveState();
  res.json({ message: 'Usuario modificado con éxito', user });
});

app.delete('/api/users/:id', (req, res) => {
  const idNum = Number(req.params.id);
  const index = dbState.users.findIndex(u => u.id === idNum);
  if (index === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

  // Prevent deleting the last remaining admin
  const userToDelete = dbState.users[index];
  if (userToDelete.role === 'admin') {
    const adminCount = dbState.users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'No se puede eliminar el único administrador del sistema' });
    }
  }

  const deleted = dbState.users.splice(index, 1)[0];
  saveState();
  res.json({ message: 'Usuario eliminado con éxito', id: idNum, user: deleted });
});

// User login endpoint (validation by PIN or User ID)
app.post('/api/auth/login', (req, res) => {
  const { userId, pin } = req.body;
  const user = dbState.users.find(u => u.id === Number(userId));
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  if (!user.active) {
    return res.status(403).json({ error: 'Este usuario está inactivo. Contacte al administrador.' });
  }

  // If user has a pin configured, check it if provided
  if (user.pin && pin && user.pin !== pin) {
    return res.status(401).json({ error: 'PIN de acceso incorrecto' });
  }

  res.json({
    message: 'Inicio de sesión exitoso',
    user,
  });
});

// Reset demo data helper
app.post('/api/reset-demo', (req, res) => {
  dbState = {
    orderCounter: 100,
    tables: INITIAL_TABLES.map(t => ({ ...t, status: 'libre' as const, activeOrderId: undefined })),
    menu: INITIAL_MENU,
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_SETTINGS,
    orders: [],
    waiters: INITIAL_WAITERS,
    users: INITIAL_USERS,
  };
  saveState();
  res.json({ message: 'Datos reiniciados con éxito', state: dbState });
});

// -------------------------------------------------------------
// VITE / STATIC SERVING
// -------------------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RestoComanda] Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
});
