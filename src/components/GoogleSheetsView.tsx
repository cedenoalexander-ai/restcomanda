import { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle,
  Copy,
  ExternalLink,
  Table as TableIcon,
  DollarSign,
  TrendingUp,
  Receipt,
  Send,
  Sparkles,
  Users,
  Check,
  ChevronRight,
  HelpCircle,
  UtensilsCrossed,
  Link2,
  AlertCircle,
  ArrowDownToLine
} from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import {
  updateSettings,
  syncGoogleSheets,
  testGoogleSheetsWebhook,
  syncUsersToGoogleSheets,
  syncTablesToGoogleSheets,
  syncMenuToGoogleSheets,
  syncUrlToGoogleSheets,
  fetchBcvFromGoogleSheets,
  resetDemoData
} from '../utils/api';

interface GoogleSheetsViewProps {
  orders: Order[];
  settings: RestaurantSettings;
  onRefresh: () => void;
  onPrintReceipt: (order: Order) => void;
}

export default function GoogleSheetsView({
  orders,
  settings,
  onRefresh,
  onPrintReceipt,
}: GoogleSheetsViewProps) {
  const [webhookUrl, setWebhookUrl] = useState(settings.googleSheetsWebhookUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingUsers, setIsSyncingUsers] = useState(false);
  const [isSyncingTables, setIsSyncingTables] = useState(false);
  const [isSyncingMenu, setIsSyncingMenu] = useState(false);
  const [isSyncingUrl, setIsSyncingUrl] = useState(false);
  const [isFetchingBcv, setIsFetchingBcv] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Synchronize input if settings update from server
  useEffect(() => {
    if (settings.googleSheetsWebhookUrl && !webhookUrl) {
      setWebhookUrl(settings.googleSheetsWebhookUrl);
    }
  }, [settings.googleSheetsWebhookUrl]);

  // Paid orders
  const paidOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === 'pagada')
      .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime());
  }, [orders]);

  // Key metrics
  const metrics = useMemo(() => {
    const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const avgTicket = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;
    const totalTips = paidOrders.reduce((sum, o) => sum + (o.tipAmount || 0), 0);
    return { totalSales, avgTicket, totalTips };
  }, [paidOrders]);

  const handleSaveWebhook = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ googleSheetsWebhookUrl: webhookUrl.trim() });
      if (webhookUrl.trim()) {
        try {
          await syncUrlToGoogleSheets(webhookUrl.trim(), settings.bcvRate);
        } catch {
          // ignore background sync error
        }
      }
      setFeedback({
        type: 'success',
        message: `URL del Webhook y Tasa BCV (Bs. ${settings.bcvRate?.toFixed(2) || '54.20'}) guardadas y sincronizadas en la pestaña "URL" de Google Sheets.`,
      });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al guardar webhook' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncGoogleSheets(webhookUrl.trim() || undefined);
      setFeedback({
        type: 'success',
        message: res.message || 'Sincronización completada con éxito con Google Sheets.',
      });
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al sincronizar con Google Sheets' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor ingresa la URL de la Aplicación Web de Google Apps Script antes de hacer la prueba.',
      });
      return;
    }
    setIsTesting(true);
    try {
      const res = await testGoogleSheetsWebhook(webhookUrl.trim());
      setFeedback({
        type: 'success',
        message: res.message || '¡Prueba enviada con éxito! Revisa tu Google Sheet en la pestaña "Ventas".',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al probar conexión con Google Sheets',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncUsers = async () => {
    if (!webhookUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor ingresa la URL de la Aplicación Web de Google Apps Script para sincronizar usuarios.',
      });
      return;
    }
    setIsSyncingUsers(true);
    try {
      const res = await syncUsersToGoogleSheets(webhookUrl.trim());
      setFeedback({
        type: 'success',
        message: res.message || '¡Usuarios sincronizados en la hoja "Usuario" de tu Google Sheet!',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al sincronizar usuarios con Google Sheets',
      });
    } finally {
      setIsSyncingUsers(false);
    }
  };

  const handleSyncTables = async () => {
    if (!webhookUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor ingresa la URL de la Aplicación Web de Google Apps Script para sincronizar las mesas.',
      });
      return;
    }
    setIsSyncingTables(true);
    try {
      const res = await syncTablesToGoogleSheets(webhookUrl.trim());
      setFeedback({
        type: 'success',
        message: res.message || '¡Mesas y su ocupación sincronizadas en la hoja "Mesas" de tu Google Sheet!',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al sincronizar mesas con Google Sheets',
      });
    } finally {
      setIsSyncingTables(false);
    }
  };

  const handleSyncMenu = async () => {
    if (!webhookUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor ingresa la URL de la Aplicación Web de Google Apps Script para sincronizar platos.',
      });
      return;
    }
    setIsSyncingMenu(true);
    try {
      const res = await syncMenuToGoogleSheets(webhookUrl.trim());
      setFeedback({
        type: 'success',
        message: res.message || '¡Platos sincronizados con la pestaña "Platos" de tu Google Sheet!',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al sincronizar platos con Google Sheets',
      });
    } finally {
      setIsSyncingMenu(false);
    }
  };

  const handleSyncUrl = async () => {
    if (!webhookUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor ingresa la URL del Webhook antes de guardarla en Google Sheets.',
      });
      return;
    }
    setIsSyncingUrl(true);
    try {
      const res = await syncUrlToGoogleSheets(webhookUrl.trim(), settings.bcvRate);
      setFeedback({
        type: 'success',
        message: res.message || `¡URL y Tasa BCV (Bs. ${settings.bcvRate?.toFixed(2) || '54.20'}) registradas con éxito en la pestaña "URL" de tu Google Sheet!`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al registrar en la pestaña "URL" de Google Sheets',
      });
    } finally {
      setIsSyncingUrl(false);
    }
  };

  const handleFetchBcvFromSheets = async () => {
    if (!webhookUrl.trim()) {
      setFeedback({
        type: 'error',
        message: 'Debe ingresar o configurar la URL del Webhook para consultar Google Sheets.',
      });
      return;
    }
    setIsFetchingBcv(true);
    try {
      const res = await fetchBcvFromGoogleSheets(webhookUrl.trim());
      if (res.success && res.bcvRate) {
        setFeedback({
          type: 'success',
          message: `¡Tasa BCV obtenida con éxito desde la pestaña "URL" de Google Sheets: Bs. ${res.bcvRate.toFixed(2)} por $1 USD! Ya está activa en todos los dispositivos.`,
        });
        onRefresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.message || res.error || 'No se encontró el parámetro TASA_BCV en la hoja "URL". Haz clic en "Guardar en Hoja URL" primero.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al consultar Google Sheets',
      });
    } finally {
      setIsFetchingBcv(false);
    }
  };

  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const handleExecuteReset = async () => {
    setShowResetConfirm(false);
    try {
      await resetDemoData();
      setFeedback({ type: 'success', message: 'Datos de comandas restablecidos.' });
      onRefresh();
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const googleAppsScriptCode = `// CÓDIGO PARA GOOGLE APPS SCRIPT
// 1. Abre tu hoja en Google Sheets
// 2. Ve a Extensiones > Apps Script
// 3. Borra todo y pega este código completo
// 4. Haz clic en "Implementar" > "Nueva implementación"
// 5. Tipo: "Aplicación web", Acceso: "Cualquier usuario"
// 6. Copia la URL resultante y pégala en esta app.

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    // 1. Registro y Guardado del Enlace Webhook y Tasa BCV (Hoja "URL")
    if (data.action === "SYNC_URL" && data.url) {
      var urlSheet = ss.getSheetByName("URL");
      if (!urlSheet) {
        urlSheet = ss.insertSheet("URL");
      }
      urlSheet.clearContents();
      urlSheet.appendRow([
        "PARAMETRO",
        "VALOR",
        "FECHA_REGISTRO",
        "DESCRIPCION"
      ]);
      urlSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#e0e7ff");
      var now = new Date().toLocaleString();
      var bcv = data.bcvRate ? Number(data.bcvRate) : 54.20;
      urlSheet.appendRow(["TASA_BCV", bcv, now, "Tasa Oficial BCV para cálculo de precios en Bolívares (Bs.) en todos los dispositivos"]);
      urlSheet.appendRow(["URL_WEBHOOK", data.url, now, "Enlace de conexión para todos los dispositivos y mesoneros"]);
      urlSheet.appendRow(["RESTAURANTE", data.restaurant || "Restaurante", now, "Nombre del negocio configurado"]);
      urlSheet.appendRow(["MONEDA_BASE", data.currencySymbol || "$", now, "Símbolo de moneda base (USD)"]);
      urlSheet.appendRow(["MONEDA_LOCAL", data.currencyBs || "Bs.", now, "Símbolo de moneda local (Bolívares)"]);
      urlSheet.appendRow(["ESTADO_CONEXION", "Activo y Conectado", now, "El Webhook está respondiendo correctamente a todos los dispositivos"]);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        url: data.url,
        bcvRate: bcv,
        message: "URL y Tasa BCV registradas en la pestaña URL"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Sincronización de Menú / Platos (Hoja "Platos")
    if (data.action === "SYNC_MENU" && data.menu) {
      var menuSheet = ss.getSheetByName("Platos");
      if (!menuSheet) {
        menuSheet = ss.insertSheet("Platos");
      }
      menuSheet.clearContents();
      menuSheet.appendRow([
        "ID_PLATO",
        "NOMBRE",
        "CATEGORIA",
        "PRECIO_USD",
        "DISPONIBLE",
        "DESCRIPCION",
        "ULTIMA_ACTUALIZACION"
      ]);
      menuSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#fef3c7");

      var now = new Date().toLocaleString();
      data.menu.forEach(function(m) {
        menuSheet.appendRow([
          m.id,
          m.name,
          m.category || "General",
          m.price || 0,
          m.available !== false ? "Disponible" : "Agotado",
          m.description || "",
          now
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.menu.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Sincronización de Mesas y Estado de Ocupación (Hoja "Mesas")
    if (data.action === "SYNC_TABLES" && data.tables) {
      var tableSheet = ss.getSheetByName("Mesas");
      if (!tableSheet) {
        tableSheet = ss.insertSheet("Mesas");
      }
      tableSheet.clearContents();
      tableSheet.appendRow([
        "ID_MESA",
        "NOMBRE_MESA",
        "CAPACIDAD",
        "ZONA",
        "ESTADO",
        "PEDIDO_ACTIVO",
        "MESONERO_ASIGNADO",
        "TOTAL_ACTUAL",
        "CANTIDAD_PLATOS",
        "ULTIMA_ACTUALIZACION"
      ]);
      tableSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#dcfce7");

      var now = new Date().toLocaleString();
      data.tables.forEach(function(t) {
        tableSheet.appendRow([
          t.id,
          t.name,
          t.capacity,
          t.zone || "Principal",
          t.status,
          t.activeOrderNumber || "Ninguno",
          t.waiterName || "N/A",
          t.total || 0,
          t.itemCount || 0,
          now
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.tables.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Sincronización de Usuarios (Hoja "Usuario")
    if (data.action === "SYNC_USERS" && data.users) {
      var userSheet = ss.getSheetByName("Usuario");
      if (!userSheet) {
        userSheet = ss.insertSheet("Usuario");
      }
      userSheet.clearContents();
      userSheet.appendRow([
        "ID_USUARIO",
        "NOMBRE_USUARIO",
        "ROL",
        "PIN",
        "ESTADO",
        "FECHA_CREACION"
      ]);
      userSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#e2e8f0");
      data.users.forEach(function(u) {
        userSheet.appendRow([
          u.id,
          u.name,
          u.role,
          u.pin || "",
          u.active ? "Activo" : "Inactivo",
          u.createdAt
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.users.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 5. Hoja de Ventas / Comandas
    var sheet = ss.getSheetByName("Ventas");
    if (!sheet) {
      var defaultSheet = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet1");
      if (defaultSheet) {
        defaultSheet.setName("Ventas");
        sheet = defaultSheet;
      } else {
        sheet = ss.insertSheet("Ventas");
      }
    }

    // Si la hoja está vacía, agregar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "FECHA_PAGO",
        "NUMERO_PEDIDO",
        "MESA",
        "MESONERO",
        "SUBTOTAL",
        "IMPUESTOS",
        "PROPINA",
        "TOTAL",
        "METODO_PAGO",
        "REFERENCIA",
        "ITEMS_CONSUMIDOS"
      ]);
      sheet.getRange("A1:K1").setFontWeight("bold").setBackground("#e2e8f0");
    }

    if (data.action === "ADD_ORDER") {
      sheet.appendRow([
        data.paidAt,
        data.orderNumber,
        data.tableName,
        data.waiterName,
        data.subtotal,
        data.taxAmount,
        data.tipAmount,
        data.total,
        data.paymentMethod,
        data.paymentReference || "",
        data.items
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === "SYNC_ALL" && data.orders) {
      var existingOrders = {};
      if (sheet.getLastRow() > 1) {
        var orderCol = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
        orderCol.forEach(function(row) {
          if (row[0]) existingOrders[String(row[0])] = true;
        });
      }
      data.orders.forEach(function(o) {
        if (!existingOrders[String(o.orderNumber)]) {
          sheet.appendRow([
            o.paidAt,
            o.orderNumber,
            o.tableName,
            o.waiterName,
            o.subtotal,
            o.taxAmount,
            o.tipAmount,
            o.total,
            o.paymentMethod,
            "",
            o.items
          ]);
        }
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: data.orders.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "received" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) || "";

    // Obtener tasa BCV y datos de la pestaña URL para todos los dispositivos
    if (action === "GET_BCV" || action === "GET_CONFIG" || action === "GET_URL") {
      var urlSheet = ss.getSheetByName("URL");
      var config = {};
      var bcvRate = null;
      if (urlSheet && urlSheet.getLastRow() > 1) {
        var data = urlSheet.getRange(2, 1, urlSheet.getLastRow() - 1, 2).getValues();
        data.forEach(function(r) {
          if (r[0]) {
            config[String(r[0])] = r[1];
            if (String(r[0]) === "TASA_BCV") bcvRate = Number(r[1]);
          }
        });
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        bcvRate: bcvRate,
        url: config["URL_WEBHOOK"] || "",
        restaurant: config["RESTAURANTE"] || "",
        config: config
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "GET_MENU") {
      var menuSheet = ss.getSheetByName("Platos");
      var items = [];
      if (menuSheet && menuSheet.getLastRow() > 1) {
        var data = menuSheet.getRange(2, 1, menuSheet.getLastRow() - 1, 6).getValues();
        items = data.map(function(r) {
          return {
            id: String(r[0]),
            name: String(r[1]),
            category: String(r[2]),
            price: Number(r[3]) || 0,
            available: String(r[4]).toLowerCase() === "disponible",
            description: String(r[5])
          };
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", menu: items }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Por defecto, retornar estado y tasa BCV de la pestaña URL si existe
    var defaultUrlSheet = ss.getSheetByName("URL");
    var defaultBcv = null;
    if (defaultUrlSheet && defaultUrlSheet.getLastRow() > 1) {
      var rows = defaultUrlSheet.getRange(2, 1, defaultUrlSheet.getLastRow() - 1, 2).getValues();
      rows.forEach(function(r) {
        if (String(r[0]) === "TASA_BCV") defaultBcv = Number(r[1]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      message: "Webhook de Restaurant POS activo",
      bcvRate: defaultBcv
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-neutral-100 text-neutral-900 p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-neutral-900">
                Google Sheets & Reportes de Ventas
              </h2>
              <p className="text-xs text-neutral-500">
                Exporta y sincroniza todas las comandas y cobros con Google Sheets o descarga en formato CSV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/api/sheets/export-csv-users"
              download
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Descargar datos para la hoja 'Usuario' de Google Sheets"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Descargar CSV Hoja "Usuario"</span>
            </a>

            <a
              href="/api/sheets/export-csv"
              download
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Descargar todas las comandas y cobros para Google Sheets"
            >
              <Download className="w-4 h-4" />
              <span>Descargar CSV Comandas</span>
            </a>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-neutral-500 hover:text-neutral-900 ml-2"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Total Ventas Cerradas
            </span>
            <div className="text-2xl font-black text-neutral-900">
              {settings.currencySymbol}
              {metrics.totalSales.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-500">{paidOrders.length} pedidos cobrados</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Ticket Promedio
            </span>
            <div className="text-2xl font-black text-neutral-900">
              {settings.currencySymbol}
              {metrics.avgTicket.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-500">Por mesa atendida</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Propinas Acumuladas
            </span>
            <div className="text-2xl font-black text-emerald-700">
              {settings.currencySymbol}
              {metrics.totalTips.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-500">Para el equipo de mesoneros</p>
          </div>
        </div>

        {/* Integration Setup Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                <span>Conexión con Google Sheets (Servidor Webhook)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Pega la URL de tu Google Apps Script implementado como Aplicación Web para recibir cada orden en tu hoja en tiempo real.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block">
                URL de la Aplicación Web (Google Apps Script Webhook):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveWebhook}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {isSaving ? 'Guardando...' : 'Guardar URL'}
                </button>
              </div>
            </div>

            {/* Test Action Buttons Bar */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-600 block uppercase tracking-wider">
                  Acciones Rápidas de Prueba & Sincronización:
                </span>
                <div className="flex items-center gap-1.5 text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                  <TrendingUp className="w-3 h-3 text-amber-700" />
                  <span>Tasa BCV: Bs. {settings.bcvRate?.toFixed(2) || '54.20'}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestWebhook}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Envía una fila de prueba ficticia (#TEST) para comprobar la conexión al instante"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : 'text-purple-200'}`} />
                  <span>{isTesting ? 'Enviando prueba...' : '🧪 Enviar Fila de Prueba'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingUsers}
                  onClick={handleSyncUsers}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Envía los usuarios (Admin, Mesoneros, Cocineros) a la pestaña 'Usuario' de Google Sheets"
                >
                  <Users className={`w-3.5 h-3.5 ${isSyncingUsers ? 'animate-spin' : 'text-blue-200'}`} />
                  <span>{isSyncingUsers ? 'Sincronizando...' : '👥 Sincronizar "Usuario"'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingTables}
                  onClick={handleSyncTables}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Envía el estado de las mesas y su ocupación a la pestaña 'Mesas' de Google Sheets"
                >
                  <TableIcon className={`w-3.5 h-3.5 ${isSyncingTables ? 'animate-spin' : 'text-amber-200'}`} />
                  <span>{isSyncingTables ? 'Sincronizando...' : '🪑 Sincronizar "Mesas"'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingMenu}
                  onClick={handleSyncMenu}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Envía el catálogo de platos y precios a la pestaña 'Platos' de Google Sheets"
                >
                  <UtensilsCrossed className={`w-3.5 h-3.5 ${isSyncingMenu ? 'animate-spin' : 'text-teal-200'}`} />
                  <span>{isSyncingMenu ? 'Sincronizando...' : '🍽️ Sincronizar "Platos"'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingUrl}
                  onClick={handleSyncUrl}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Registra este enlace webhook y la Tasa BCV actual en la pestaña 'URL' de tu Google Sheet"
                >
                  <Link2 className={`w-3.5 h-3.5 ${isSyncingUrl ? 'animate-spin' : 'text-indigo-200'}`} />
                  <span>{isSyncingUrl ? 'Guardando...' : '🔗 Guardar URL & Tasa BCV'}</span>
                </button>

                <button
                  type="button"
                  disabled={isFetchingBcv}
                  onClick={handleFetchBcvFromSheets}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Consulta la Tasa BCV guardada en la pestaña 'URL' de Google Sheets y la aplica en todos los dispositivos"
                >
                  <ArrowDownToLine className={`w-3.5 h-3.5 ${isFetchingBcv ? 'animate-spin' : 'text-violet-200'}`} />
                  <span>{isFetchingBcv ? 'Consultando...' : '📥 Leer BCV de Hoja "URL"'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleManualSync}
                  className="flex-1 min-w-[140px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="Sincroniza todos los pedidos cobrados con la hoja 'Ventas'"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : 'text-emerald-200'}`} />
                  <span>{isSyncing ? 'Sincronizando...' : '🔄 Sincronizar "Ventas"'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs">
              <span className="text-neutral-500 text-[11px]">
                {settings.googleSheetsLastSync
                  ? `Última sincronización: ${new Date(settings.googleSheetsLastSync).toLocaleTimeString()}`
                  : 'Aún no sincronizado'}
              </span>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 underline decoration-dotted cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                <span>{showGuide ? 'Ocultar Guía de Prueba' : 'Ver Guía de Prueba'}</span>
              </button>
            </div>
          </div>

          {/* Quick instructions & Script Copy */}
          <div className="lg:col-span-6 bg-neutral-900 text-neutral-100 p-5 rounded-2xl border border-neutral-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <span>Código para tu Google Sheet</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  Copia y pega este script en tu Google Sheet en 30 segundos:
                </p>
              </div>

              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700"
              >
                {copiedScript ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? '¡Copiado!' : 'Copiar Script'}</span>
              </button>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 font-mono text-[11px] text-neutral-300 max-h-36 overflow-y-auto">
              <pre>{googleAppsScriptCode}</pre>
            </div>

            <p className="text-[11px] text-neutral-400">
              💡 <strong>Pasos rápidos:</strong> Abre Google Sheets &gt; Extensiones &gt; Apps Script &gt; Pega este código &gt; Implementar como Aplicación Web con acceso para "Cualquiera" &gt; Copia la URL arriba.
            </p>
          </div>
        </div>

        {/* Step-by-Step Testing Guide Card */}
        {showGuide && (
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-5 rounded-2xl border border-neutral-700 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    ¿Cómo probar la integración con tu Google Sheet paso a paso?
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Sigue estos 4 sencillos pasos para verificar la conexión en menos de 2 minutos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-neutral-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                Ocultar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-200 text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-bold text-white">Obtener URL Web</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  En tu Google Sheet ve a <strong>Extensiones &gt; Apps Script</strong>. Haz clic en <strong>Implementar &gt; Nueva implementación</strong>, selecciona <em>"Aplicación web"</em>, en "Quién tiene acceso" pon <strong>"Cualquiera"</strong> y copia la URL que termina en <code className="text-emerald-400 font-mono text-[10px]">/exec</code>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-200 text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold text-white">Guardar en la App</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Pega esa URL en el campo de texto arriba a la izquierda y presiona el botón negro <strong>"Guardar URL"</strong>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-300 text-xs font-black flex items-center justify-center border border-purple-500/30">
                    3
                  </span>
                  <span className="text-xs font-bold text-purple-300">Prueba Instantánea</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Haz clic en el botón morado <strong>"🧪 Enviar Fila de Prueba"</strong>. Abre tu Google Sheet y en la pestaña <em>"Ventas"</em> verás aparecer la fila de prueba al instante.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/40 text-emerald-300 text-xs font-black flex items-center justify-center border border-emerald-500/30">
                    4
                  </span>
                  <span className="text-xs font-bold text-emerald-300">Prueba Real de Venta</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Ve a <strong>Mesonero</strong> &gt; toma una orden &gt; ve a <strong>Caja & Cuentas</strong> &gt; cobra la mesa. Al confirmarse el pago, la comanda se envía automáticamente a tu Sheet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Orders History Table */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900">
              Historial de Pedidos Cobrados ({paidOrders.length})
            </h3>
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs text-neutral-400 hover:text-rose-600 transition-colors"
            >
              Reiniciar Datos Demo
            </button>
          </div>

          {paidOrders.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              Aún no se han cobrado pedidos. Cuando un cliente pague en la sección de Caja, aparecerá aquí registrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3">Pedido</th>
                    <th className="py-2 px-3">Mesa</th>
                    <th className="py-2 px-3">Mesonero</th>
                    <th className="py-2 px-3">Fecha & Hora</th>
                    <th className="py-2 px-3">Método Pago</th>
                    <th className="py-2 px-3">Items</th>
                    <th className="py-2 px-3 text-right">Total</th>
                    <th className="py-2 px-3 text-center">Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {paidOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-neutral-900">
                        #{order.orderNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-neutral-800">
                        {order.tableName}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">{order.waiterName}</td>
                      <td className="py-2.5 px-3 text-neutral-500">
                        {order.paidAt
                          ? new Date(order.paidAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-medium">
                          {order.paymentMethod?.replace('_', ' ') || 'Efectivo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 max-w-xs truncate">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-neutral-900">
                        {settings.currencySymbol}
                        {order.total.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onPrintReceipt(order)}
                          className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-600"
                          title="Imprimir ticket de este pedido"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-neutral-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900">
                ¿Restablecer datos demo?
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Esta acción borrará el historial de pedidos cobrados y restaurará las mesas y datos a su estado inicial.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sí, Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
