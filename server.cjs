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
var import_vite = require("vite");

// src/data/initialData.ts
var INITIAL_MENU = [
  // Entradas
  {
    id: "m-1",
    name: "Teque\xF1os Gourmet (6 uds)",
    description: "Crujientes deditos de queso blanco con salsa t\xE1rtara de la casa",
    price: 6.5,
    category: "Entradas",
    available: true,
    preparationTimeMinutes: 10
  },
  {
    id: "m-2",
    name: "Ceviche Cl\xE1sico",
    description: "Pescado blanco fresco marinado en lima, cebolla morada, cilantro y ma\xEDz",
    price: 9,
    category: "Entradas",
    available: true,
    preparationTimeMinutes: 12
  },
  {
    id: "m-3",
    name: "Empanaditas de Caz\xF3n y Queso (4 uds)",
    description: "Mini empanadas crocantes con guiso de caz\xF3n oriental y queso gouda",
    price: 5.5,
    category: "Entradas",
    available: true,
    preparationTimeMinutes: 8
  },
  // Platos Fuertes
  {
    id: "m-4",
    name: "Hamburguesa Angus Especial",
    description: "Carne Angus 200g, queso cheddar, tocineta crujiente, cebolla caramelizada y papas fritas",
    price: 12.5,
    category: "Platos Fuertes",
    available: true,
    preparationTimeMinutes: 15
  },
  {
    id: "m-5",
    name: "Pabell\xF3n Criollo Especial",
    description: "Carne mechada tierna, arroz blanco, caraotas negras, tajadas de pl\xE1tano maduro y queso blanco rallado",
    price: 11,
    category: "Platos Fuertes",
    available: true,
    preparationTimeMinutes: 14
  },
  {
    id: "m-6",
    name: "Churrasco Santa B\xE1rbara (350g)",
    description: "Corte de res jugoso a la parrilla con yuca frita, chimichurri y ensalada fresca",
    price: 16,
    category: "Platos Fuertes",
    available: true,
    preparationTimeMinutes: 18
  },
  {
    id: "m-7",
    name: "Pasta Carbonara Artesanal",
    description: "Fettuccine con panceta crujiente, yema de huevo, queso parmesano reggiano y pimienta negra",
    price: 10.5,
    category: "Platos Fuertes",
    available: true,
    preparationTimeMinutes: 12
  },
  {
    id: "m-8",
    name: "Pollo a la Canasta con Papas",
    description: "Piezas de pollo empanizadas y crujientes con papas fritas y ensalada coleslaw",
    price: 9.5,
    category: "Platos Fuertes",
    available: true,
    preparationTimeMinutes: 14
  },
  // Bebidas
  {
    id: "m-9",
    name: "Papel\xF3n con Lim\xF3n Fr\xEDo",
    description: "Bebida tradicional refrescante con lim\xF3n reci\xE9n exprimido y hielo",
    price: 2.5,
    category: "Bebidas",
    available: true,
    preparationTimeMinutes: 3
  },
  {
    id: "m-10",
    name: "Jugo Natural de Maracuy\xE1 / Parchita",
    description: "Jugo natural espeso y refrescante",
    price: 3,
    category: "Bebidas",
    available: true,
    preparationTimeMinutes: 4
  },
  {
    id: "m-11",
    name: "Cerveza Polar Pilsen / Zulia",
    description: "Cerveza nacional bien fr\xEDa (330ml)",
    price: 2,
    category: "Bebidas",
    available: true,
    preparationTimeMinutes: 2
  },
  {
    id: "m-12",
    name: "Refresco Lata (Coca-Cola / Sprite)",
    description: "Lata 355ml fr\xEDa con vaso y hielo",
    price: 2,
    category: "Bebidas",
    available: true,
    preparationTimeMinutes: 2
  },
  // Postres
  {
    id: "m-13",
    name: "Quesillo Casero Tradicional",
    description: "Flan venezolano con caramelo dorado oscuro y toque de vainilla",
    price: 4.5,
    category: "Postres",
    available: true,
    preparationTimeMinutes: 3
  },
  {
    id: "m-14",
    name: "Tres Leches de Maracuy\xE1",
    description: "Bizcocho esponjoso ba\xF1ado en tres leches con mousse de maracuy\xE1",
    price: 5,
    category: "Postres",
    available: true,
    preparationTimeMinutes: 4
  }
];
var INITIAL_TABLES = [
  { id: "t-1", name: "Mesa 1", capacity: 2, status: "libre" },
  { id: "t-2", name: "Mesa 2", capacity: 4, status: "libre" },
  { id: "t-3", name: "Mesa 3", capacity: 4, status: "libre" },
  { id: "t-4", name: "Mesa 4", capacity: 6, status: "libre" },
  { id: "t-5", name: "Mesa 5", capacity: 2, status: "libre" },
  { id: "t-6", name: "Mesa 6", capacity: 4, status: "libre" },
  { id: "t-7", name: "Mesa 7 (Terraza)", capacity: 4, status: "libre" },
  { id: "t-8", name: "Mesa 8 (Terraza)", capacity: 6, status: "libre" },
  { id: "t-9", name: "Barra 1", capacity: 1, status: "libre" },
  { id: "t-10", name: "Barra 2", capacity: 1, status: "libre" }
];
var INITIAL_STATE = {
  tables: INITIAL_TABLES,
  menu: INITIAL_MENU,
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
    scriptUrl: "",
    sheetName: "VENTAS_RESTAURANTE",
    autoSync: true
  }
};

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var state = JSON.parse(JSON.stringify(INITIAL_STATE));
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
  const newOrderItems = items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    menuItemId: item.menuItemId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    notes: item.notes || "",
    roundNumber: nextRound,
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
    isAdditional: nextRound > 1,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "en_cola",
    items: newOrderItems
  };
  state.kitchenTickets.unshift(ticket);
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
  res.json({
    success: true,
    config: state.googleSheetsConfig,
    testResult
  });
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
  broadcast({
    type: "INIT_STATE",
    payload: state,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  res.json({ success: true, state });
});
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
