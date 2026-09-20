var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");

// src/data/initialData.ts
var INITIAL_MENU = [
  // Sopas
  {
    id: "m-soup-1",
    name: "Sopa de Res",
    description: "Tradicional sopa de costilla y res con verduras frescas, cilantro y yuca",
    price: 4,
    category: "Sopas",
    available: true,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 8,
    frequentNotes: ["Sin cilantro", "Poco picante", "Caliente", "Sin yuca", "Con lim\xF3n extra"]
  },
  // Plato Principal
  {
    id: "m-pizza-1",
    name: "Pizza Familiar",
    description: "ingredientes, salsa, queso mozzarella, jamon, maiz",
    price: 10,
    category: "Plato Principal",
    available: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 15,
    frequentNotes: ["Sin ma\xEDz", "Bien dorada", "Corte en 8 pedazos", "Orilla crocante", "Para llevar"]
  },
  {
    id: "m-pabellon-1",
    name: "Pabell\xF3n Criollo Especial",
    description: "Carne mechada tierna, arroz blanco, caraotas negras, tajadas de pl\xE1tano maduro y queso blanco rallado",
    price: 11,
    category: "Plato Principal",
    available: true,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 14,
    frequentNotes: ["Sin tajadas", "Caraotas sin queso", "Arroz extra", "Carne bien jugosa", "Tajadas bien doradas"]
  },
  {
    id: "m-burger-1",
    name: "Hamburguesa Angus Especial",
    description: "Carne Angus 200g, queso cheddar, tocineta crujiente, cebolla caramelizada y papas fritas",
    price: 12.5,
    category: "Plato Principal",
    available: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 15,
    frequentNotes: ["Sin cebolla", "T\xE9rmino medio", "Bien cocida", "Salsa aparte", "Sin tocineta", "Papas bien crocantes"]
  },
  {
    id: "m-churrasco-1",
    name: "Churrasco Santa B\xE1rbara (350g)",
    description: "Corte de res jugoso a la parrilla con yuca frita, chimichurri y ensalada fresca",
    price: 16,
    category: "Plato Principal",
    available: true,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 18,
    frequentNotes: ["T\xE9rmino medio", "Tres cuartos", "Bien cocido", "Chimichurri aparte", "Yuca sancochada", "Poca sal"]
  },
  // Desayunos
  {
    id: "m-empanadas-1",
    name: "Empanadas",
    description: "Empanadas de carne mechada, pollo o queso",
    price: 2,
    category: "Desayunos",
    available: true,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 8,
    frequentNotes: ["De carne mechada", "De pollo", "De queso blanco", "Bien tostada", "Con guasacaca"]
  },
  {
    id: "m-arepas-1",
    name: "Arepas",
    description: "De reina Pepiada, queso amarillo, carne mechada, pollo",
    price: 2.5,
    category: "Desayunos",
    available: true,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 10,
    frequentNotes: ["Reina Pepiada", "Carne Mechada con Queso", "Asada bien tostada", "Sin mantequilla", "Poco relleno"]
  },
  {
    id: "m-cachapas-1",
    name: "Cachapas",
    description: "queso de mano y cochino",
    price: 5,
    category: "Desayunos",
    available: true,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 12,
    frequentNotes: ["Con cochino frito", "Solo queso de mano", "Mantequilla extra", "Doble queso"]
  },
  // Entradas
  {
    id: "m-tequenos-1",
    name: "Teque\xF1os Gourmet (6 uds)",
    description: "Crujientes deditos de queso blanco con salsa t\xE1rtara de la casa",
    price: 6.5,
    category: "Entradas",
    available: true,
    image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 10,
    frequentNotes: ["Salsa t\xE1rtara extra", "Bien dorados", "Salsa de ajo aparte", "Para compartir"]
  },
  // Bebidas
  {
    id: "m-refresco-1",
    name: "Refresco de 2Lts Coacola",
    description: "Refresco 2 litros bien fr\xEDo para compartir",
    price: 1.8,
    category: "Bebidas",
    available: true,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 2,
    frequentNotes: ["Vasos con hielo", "Sin hielo", "Vaso extra", "Pitillos / Popotes"]
  },
  {
    id: "m-papelon-1",
    name: "Papel\xF3n con Lim\xF3n Fr\xEDo",
    description: "Bebida tradicional refrescante con lim\xF3n reci\xE9n exprimido y hielo",
    price: 2.5,
    category: "Bebidas",
    available: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 3,
    frequentNotes: ["Bien fr\xEDo", "Sin hielo", "Con poco lim\xF3n", "Lim\xF3n extra"]
  },
  // Postre
  {
    id: "m-quesillo-1",
    name: "Quesillo Casero Tradicional",
    description: "Flan venezolano con caramelo dorado oscuro y toque de vainilla",
    price: 4.5,
    category: "Postre",
    available: true,
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 3,
    frequentNotes: ["Caramelo extra", "Para llevar", "Con 2 cucharitas"]
  },
  // Ensaladas
  {
    id: "m-salad-1",
    name: "Ensalada C\xE9sar con Pollo",
    description: "Lechuga romana fresca, pechuga a la plancha, crutones, parmesano y aderezo c\xE9sar",
    price: 7.5,
    category: "Ensaladas",
    available: true,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=400&q=80",
    preparationTimeMinutes: 8,
    frequentNotes: ["Aderezo aparte", "Sin crutones", "Parmesano extra", "Pollo bien dorado"]
  }
];
var INITIAL_TABLES = [
  { id: "t-1", name: "Mesa 1", capacity: 4, status: "libre", zone: "Sal\xF3n Principal" },
  { id: "t-2", name: "Mesa 2", capacity: 2, status: "libre", zone: "Sal\xF3n Principal" },
  { id: "t-3", name: "Mesa 3", capacity: 2, status: "libre", zone: "Sal\xF3n Principal" },
  { id: "t-4", name: "Mesa 4", capacity: 6, status: "libre", zone: "Sal\xF3n Principal" },
  { id: "t-5", name: "Mesa 5", capacity: 2, status: "libre", zone: "Sal\xF3n Principal" },
  { id: "t-6", name: "Mesa 6", capacity: 4, status: "libre", zone: "Sal\xF3n Principal" },
  { id: "t-7", name: "Mesa 7 (VIP)", capacity: 8, status: "libre", zone: "\xC1rea VIP" },
  { id: "t-8", name: "Terraza 1", capacity: 4, status: "libre", zone: "Terraza al Aire Libre" },
  { id: "t-9", name: "Terraza 2", capacity: 4, status: "libre", zone: "Terraza al Aire Libre" },
  { id: "t-10", name: "Barra 1", capacity: 2, status: "libre", zone: "Barra de Tragos" },
  { id: "t-11", name: "Barra 2", capacity: 2, status: "libre", zone: "Barra de Tragos" }
];
var DEFAULT_USERS = [
  { id: "w-1", name: "Carlos Mendoza", username: "carlos", password: "123", role: "mesonero", active: true },
  { id: "w-2", name: "Elena Ram\xEDrez", username: "elena", password: "123", role: "mesonero", active: true },
  { id: "k-1", name: "Chef Mario (Cocina)", username: "cocina", password: "123", role: "cocina", active: true },
  { id: "c-1", name: "Ana Cajera", username: "cajero", password: "123", role: "cajero", active: true },
  { id: "a-1", name: "Admin Principal", username: "admin", password: "123", role: "admin", active: true },
  { id: "d-1", name: "Desarrollador", username: "desarrollador", password: "123", role: "admin", active: true }
];
var INITIAL_STATE = {
  tables: INITIAL_TABLES,
  menu: INITIAL_MENU,
  users: DEFAULT_USERS,
  activeOrders: {},
  kitchenTickets: [],
  paymentHistory: [
    {
      FECHA_PAGO: new Date(Date.now() - 36e5 * 2).toLocaleString("es-ES"),
      NUMERO_PEDIDO: "PED-1001",
      MESA: "Mesa 2",
      MESONERO: "Carlos Mendoza",
      SUBTOTAL: 25.5,
      IMPUESTOS: 4.08,
      PROPINA: 2.55,
      TOTAL: 32.13,
      METODO_PAGO: "Tarjeta de D\xE9bito",
      REFERENCIA: "REF-889102",
      ITEMS_CONSUMIDOS: "2x Hamburguesa Angus Especial, 1x Papel\xF3n con Lim\xF3n Fr\xEDo",
      syncedToSheet: false
    }
  ],
  googleSheetsConfig: {
    scriptUrl: "https://script.google.com/macros/s/AKfycbw8kG8U51aXVtHSuhinK4CYx4VBaJPsxdGwW1ANqje5c7j9fZ0be_rZNf32c6gRn1kK/exec",
    sheetName: "VENTAS_RESTAURANTE",
    autoSync: true
  },
  themeConfig: {
    mode: "dark",
    palette: "amber"
  },
  bcvConfig: {
    rate: 54.5,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    currencyName: "Bol\xEDvares",
    symbol: "Bs."
  },
  restaurantInfo: {
    name: "ComandaPro Restaurante",
    phone: "+58 412 1234567"
  },
  printerConfig: {
    type: "80mm",
    density: "normal",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  }
};

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var STATE_FILE = import_path.default.join(process.cwd(), "server_state.json");
function loadServerState() {
  try {
    if (import_fs.default.existsSync(STATE_FILE)) {
      const raw = import_fs.default.readFileSync(STATE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.tables)) {
        return {
          ...INITIAL_STATE,
          ...parsed,
          bcvConfig: {
            ...INITIAL_STATE.bcvConfig,
            ...parsed.bcvConfig || {}
          },
          restaurantInfo: {
            ...INITIAL_STATE.restaurantInfo,
            ...parsed.restaurantInfo || {}
          },
          googleSheetsConfig: {
            ...INITIAL_STATE.googleSheetsConfig,
            ...parsed.googleSheetsConfig || {}
          }
        };
      }
    }
  } catch (err) {
    console.warn("Could not load server_state.json, falling back to INITIAL_STATE:", err);
  }
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}
var state = loadServerState();
function saveServerState() {
  try {
    import_fs.default.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing server_state.json:", err);
  }
}
var sseClients = /* @__PURE__ */ new Set();
function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}

`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}
setInterval(() => {
  const ping = {
    type: "PING",
    payload: { activeClients: sseClients.size },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  const payload = `data: ${JSON.stringify(ping)}

`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}, 2e4);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString(), clients: sseClients.size });
});
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  sseClients.add(res);
  const initEvent = {
    type: "INIT_STATE",
    payload: state,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  res.write(`data: ${JSON.stringify(initEvent)}

`);
  req.on("close", () => {
    sseClients.delete(res);
  });
});
app.get("/api/state", (req, res) => {
  res.json(state);
});
app.post("/api/tables/:id/occupy", (req, res) => {
  const { id } = req.params;
  const { waiterId, waiterName } = req.body;
  const table = state.tables.find((t) => t.id === id);
  if (!table) {
    res.status(404).json({ error: "Mesa no encontrada" });
    return;
  }
  if (table.status === "ocupada" && table.occupiedByWaiterId && table.occupiedByWaiterId !== waiterId) {
    res.status(409).json({
      error: `La ${table.name} ya est\xE1 ocupada por el mesonero ${table.occupiedByWaiterName}`,
      table
    });
    return;
  }
  table.status = "ocupada";
  table.occupiedByWaiterId = waiterId;
  table.occupiedByWaiterName = waiterName;
  table.occupiedSince = table.occupiedSince || (/* @__PURE__ */ new Date()).toISOString();
  if (!table.currentOrderId || !state.activeOrders[table.currentOrderId]) {
    const orderId = "ord-" + Date.now();
    const orderNumber = "PED-" + Math.floor(1e3 + Math.random() * 9e3);
    const newOrder = {
      id: orderId,
      orderNumber,
      tableId: table.id,
      tableName: table.name,
      waiterId,
      waiterName,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "abierta",
      items: [],
      currentRound: 0,
      totalRounds: 0
    };
    table.currentOrderId = orderId;
    state.activeOrders[orderId] = newOrder;
  }
  saveServerState();
  broadcast({
    type: "TABLES_UPDATED",
    payload: { tables: state.tables, activeOrders: state.activeOrders },
    sender: waiterName,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, table, order: state.activeOrders[table.currentOrderId] });
});
app.post("/api/tables/:id/release", (req, res) => {
  const { id } = req.params;
  const table = state.tables.find((t) => t.id === id);
  if (!table) {
    res.status(404).json({ error: "Mesa no encontrada" });
    return;
  }
  table.status = "libre";
  table.occupiedByWaiterId = void 0;
  table.occupiedByWaiterName = void 0;
  table.occupiedSince = void 0;
  if (table.currentOrderId) {
    delete state.activeOrders[table.currentOrderId];
    table.currentOrderId = void 0;
  }
  saveServerState();
  broadcast({
    type: "TABLES_UPDATED",
    payload: { tables: state.tables, activeOrders: state.activeOrders },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, table });
});
app.post("/api/orders", (req, res) => {
  const { tableId, waiterId, waiterName, items } = req.body;
  const table = state.tables.find((t) => t.id === tableId);
  if (!table) {
    res.status(404).json({ error: "Mesa no encontrada" });
    return;
  }
  let order = table.currentOrderId ? state.activeOrders[table.currentOrderId] : null;
  if (!order) {
    const orderId = "ord-" + Date.now();
    order = {
      id: orderId,
      orderNumber: "PED-" + Math.floor(1e3 + Math.random() * 9e3),
      tableId: table.id,
      tableName: table.name,
      waiterId,
      waiterName,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "en_cocina",
      items: [],
      currentRound: 0,
      totalRounds: 0
    };
    table.currentOrderId = orderId;
    table.status = "ocupada";
    table.occupiedByWaiterId = waiterId;
    table.occupiedByWaiterName = waiterName;
    state.activeOrders[orderId] = order;
  }
  const nextRound = (order.currentRound || 0) + 1;
  order.currentRound = nextRound;
  order.totalRounds = nextRound;
  order.status = "en_cocina";
  order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const isAdditionalOrder = nextRound > 1 || order.items && order.items.length > 0;
  const newOrderItems = items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    menuItemId: item.menuItemId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    notes: item.notes || "",
    roundNumber: nextRound,
    isAdditional: isAdditionalOrder,
    status: "en_cola",
    addedAt: (/* @__PURE__ */ new Date()).toISOString()
  }));
  order.items.push(...newOrderItems);
  const ticket = {
    id: "kt-" + Date.now() + "-" + Math.floor(Math.random() * 1e3),
    orderId: order.id,
    orderNumber: order.orderNumber,
    tableId: table.id,
    tableName: table.name,
    waiterName,
    roundNumber: nextRound,
    isAdditional: isAdditionalOrder,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "en_cola",
    items: newOrderItems
  };
  state.kitchenTickets.unshift(ticket);
  saveServerState();
  broadcast({
    type: "ORDER_UPDATED",
    payload: {
      order,
      ticket,
      tables: state.tables,
      activeOrders: state.activeOrders,
      kitchenTickets: state.kitchenTickets
    },
    sender: waiterName,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, order, ticket });
});
app.post("/api/kitchen/:ticketId/status", (req, res) => {
  const { ticketId } = req.params;
  const { status, itemId } = req.body;
  const ticket = state.kitchenTickets.find((k) => k.id === ticketId);
  if (!ticket) {
    res.status(404).json({ error: "Ticket de cocina no encontrado" });
    return;
  }
  if (itemId) {
    const item = ticket.items.find((i) => i.id === itemId);
    if (item) {
      item.status = status;
    }
  } else if (status) {
    ticket.status = status;
    ticket.items.forEach((i) => {
      i.status = status;
    });
  }
  const order = state.activeOrders[ticket.orderId];
  if (order) {
    ticket.items.forEach((tItem) => {
      const oItem = order.items.find((oi) => oi.id === tItem.id);
      if (oItem) {
        oItem.status = tItem.status;
      }
    });
  }
  saveServerState();
  broadcast({
    type: "KITCHEN_UPDATED",
    payload: {
      kitchenTickets: state.kitchenTickets,
      activeOrders: state.activeOrders
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, ticket });
});
app.post("/api/tables/:id/request-bill", (req, res) => {
  const { id } = req.params;
  const table = state.tables.find((t) => t.id === id);
  if (!table) {
    res.status(404).json({ error: "Mesa no encontrada" });
    return;
  }
  table.status = "cuenta_solicitada";
  if (table.currentOrderId && state.activeOrders[table.currentOrderId]) {
    state.activeOrders[table.currentOrderId].status = "por_cobrar";
  }
  saveServerState();
  broadcast({
    type: "TABLES_UPDATED",
    payload: { tables: state.tables, activeOrders: state.activeOrders },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, table });
});
app.post("/api/checkout", async (req, res) => {
  const {
    tableId,
    metodoPago,
    referencia,
    propina = 0,
    impuestos = 0
  } = req.body;
  const table = state.tables.find((t) => t.id === tableId);
  if (!table || !table.currentOrderId) {
    res.status(400).json({ error: "Mesa sin orden activa para cobrar" });
    return;
  }
  const order = state.activeOrders[table.currentOrderId];
  if (!order) {
    res.status(400).json({ error: "Orden no encontrada" });
    return;
  }
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = Number(impuestos) || 0;
  const tipAmount = Number(propina) || 0;
  const total = Number((subtotal + taxAmount + tipAmount).toFixed(2));
  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.name}${i.notes ? ` (${i.notes})` : ""}`).join(", ");
  const paymentRecord = {
    FECHA_PAGO: (/* @__PURE__ */ new Date()).toLocaleString("es-ES", { timeZoneName: "short" }),
    NUMERO_PEDIDO: order.orderNumber,
    MESA: table.name,
    MESONERO: order.waiterName,
    SUBTOTAL: Number(subtotal.toFixed(2)),
    IMPUESTOS: Number(taxAmount.toFixed(2)),
    PROPINA: Number(tipAmount.toFixed(2)),
    TOTAL: total,
    METODO_PAGO: metodoPago || "Efectivo",
    REFERENCIA: referencia || "N/A",
    ITEMS_CONSUMIDOS: itemsSummary,
    syncedToSheet: false
  };
  table.status = "libre";
  table.occupiedByWaiterId = void 0;
  table.occupiedByWaiterName = void 0;
  table.occupiedSince = void 0;
  delete state.activeOrders[order.id];
  table.currentOrderId = void 0;
  if (state.googleSheetsConfig.scriptUrl && state.googleSheetsConfig.autoSync) {
    try {
      const gResponse = await fetch(state.googleSheetsConfig.scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_PAYMENT",
          payment: paymentRecord
        })
      });
      const gResult = await gResponse.json();
      if (gResult && gResult.status === "success") {
        paymentRecord.syncedToSheet = true;
        state.googleSheetsConfig.lastSyncedAt = (/* @__PURE__ */ new Date()).toISOString();
      } else {
        paymentRecord.syncError = gResult?.message || "Error en respuesta de Google Sheets";
      }
    } catch (gErr) {
      paymentRecord.syncError = gErr.message || "No se pudo conectar con Google Apps Script";
    }
  }
  state.paymentHistory.unshift(paymentRecord);
  saveServerState();
  broadcast({
    type: "PAYMENT_PROCESSED",
    payload: {
      payment: paymentRecord,
      tables: state.tables,
      activeOrders: state.activeOrders,
      paymentHistory: state.paymentHistory
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, payment: paymentRecord });
});
app.post("/api/menu", (req, res) => {
  const { name, description, price, category, available = true, preparationTimeMinutes = 10, image } = req.body;
  if (!name || price === void 0) {
    res.status(400).json({ error: "Nombre y precio son obligatorios" });
    return;
  }
  const newItem = {
    id: "m-" + Date.now(),
    name,
    description: description || "",
    price: Number(price),
    category: category || "Platos Fuertes",
    available: available !== false,
    image,
    preparationTimeMinutes: Number(preparationTimeMinutes) || 10
  };
  state.menu.push(newItem);
  saveServerState();
  broadcast({
    type: "MENU_UPDATED",
    payload: { menu: state.menu },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, item: newItem });
});
app.put("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const itemIndex = state.menu.findIndex((m) => m.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: "Plato no encontrado" });
    return;
  }
  state.menu[itemIndex] = {
    ...state.menu[itemIndex],
    ...req.body,
    price: req.body.price !== void 0 ? Number(req.body.price) : state.menu[itemIndex].price
  };
  saveServerState();
  broadcast({
    type: "MENU_UPDATED",
    payload: { menu: state.menu },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, item: state.menu[itemIndex] });
});
app.delete("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  state.menu = state.menu.filter((m) => m.id !== id);
  saveServerState();
  broadcast({
    type: "MENU_UPDATED",
    payload: { menu: state.menu },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true });
});
app.post("/api/tables", (req, res) => {
  const { name, capacity = 4 } = req.body;
  const newTable = {
    id: "t-" + Date.now(),
    name: name || `Mesa ${state.tables.length + 1}`,
    capacity: Number(capacity) || 4,
    status: "libre"
  };
  state.tables.push(newTable);
  saveServerState();
  broadcast({
    type: "TABLES_UPDATED",
    payload: { tables: state.tables },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, table: newTable });
});
app.post("/api/settings/google-sheets", async (req, res) => {
  const { scriptUrl, sheetName, autoSync } = req.body;
  state.googleSheetsConfig.scriptUrl = scriptUrl !== void 0 ? scriptUrl.trim() : state.googleSheetsConfig.scriptUrl;
  state.googleSheetsConfig.sheetName = sheetName || state.googleSheetsConfig.sheetName;
  state.googleSheetsConfig.autoSync = autoSync !== void 0 ? !!autoSync : state.googleSheetsConfig.autoSync;
  saveServerState();
  let testResult = null;
  if (state.googleSheetsConfig.scriptUrl) {
    try {
      const resp = await fetch(state.googleSheetsConfig.scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TEST_CONNECTION" })
      });
      testResult = await resp.json();
    } catch (err) {
      testResult = { status: "error", message: err.message };
    }
  }
  broadcast({
    type: "INIT_STATE",
    payload: state,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({
    success: true,
    config: state.googleSheetsConfig,
    testResult
  });
});
app.post("/api/bcv", (req, res) => {
  const { rate, restaurantName, restaurantPhone, name, phone } = req.body;
  const numRate = Number(rate);
  if (isNaN(numRate) || numRate <= 0) {
    res.status(400).json({ error: "Tasa BCV inv\xE1lida" });
    return;
  }
  state.bcvConfig = {
    rate: numRate,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    currencyName: "Bol\xEDvares",
    symbol: "Bs."
  };
  const finalName = restaurantName || name;
  const finalPhone = restaurantPhone || phone;
  if (finalName || finalPhone) {
    state.restaurantInfo = {
      name: finalName && String(finalName).trim() || state.restaurantInfo?.name || "ComandaPro Restaurante",
      phone: finalPhone && String(finalPhone).trim() || state.restaurantInfo?.phone || "+58 412 1234567"
    };
  }
  saveServerState();
  broadcast({
    type: "BCV_UPDATED",
    payload: { bcvConfig: state.bcvConfig, restaurantInfo: state.restaurantInfo },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, bcvConfig: state.bcvConfig, restaurantInfo: state.restaurantInfo });
});
app.post("/api/restaurant-info", (req, res) => {
  const { name, phone, rate } = req.body;
  state.restaurantInfo = {
    name: name && String(name).trim() || state.restaurantInfo?.name || "ComandaPro Restaurante",
    phone: phone && String(phone).trim() || state.restaurantInfo?.phone || "+58 412 1234567"
  };
  if (rate) {
    const numRate = Number(rate);
    if (!isNaN(numRate) && numRate > 0) {
      state.bcvConfig = {
        rate: numRate,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        currencyName: "Bol\xEDvares",
        symbol: "Bs."
      };
    }
  }
  saveServerState();
  broadcast({
    type: "RESTAURANT_INFO_UPDATED",
    payload: { restaurantInfo: state.restaurantInfo, bcvConfig: state.bcvConfig },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, restaurantInfo: state.restaurantInfo, bcvConfig: state.bcvConfig });
});
app.post("/api/sync-sheet/pending", async (req, res) => {
  if (!state.googleSheetsConfig.scriptUrl) {
    res.status(400).json({ error: "No hay URL de Google Apps Script configurada" });
    return;
  }
  const unSynced = state.paymentHistory.filter((p) => !p.syncedToSheet);
  let syncedCount = 0;
  let errors = [];
  for (const payment of unSynced) {
    try {
      const resp = await fetch(state.googleSheetsConfig.scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD_PAYMENT", payment })
      });
      const result = await resp.json();
      if (result && result.status === "success") {
        payment.syncedToSheet = true;
        payment.syncError = void 0;
        syncedCount++;
      } else {
        payment.syncError = result?.message || "Error en Google Sheets";
        errors.push(payment.syncError || "Error");
      }
    } catch (err) {
      payment.syncError = err.message;
      errors.push(err.message);
    }
  }
  if (syncedCount > 0) {
    state.googleSheetsConfig.lastSyncedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  broadcast({
    type: "PAYMENT_PROCESSED",
    payload: { paymentHistory: state.paymentHistory },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, syncedCount, errors });
});
app.post("/api/reset-demo", (req, res) => {
  const currentSheetsConfig = state.googleSheetsConfig;
  state = JSON.parse(JSON.stringify(INITIAL_STATE));
  state.googleSheetsConfig = currentSheetsConfig;
  saveServerState();
  broadcast({
    type: "INIT_STATE",
    payload: state,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, state });
});
app.use(import_express.default.static(import_path.default.join(process.cwd(), "public")));
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ComandaPro] Server running on http://0.0.0.0:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
