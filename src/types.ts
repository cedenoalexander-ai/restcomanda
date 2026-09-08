export type OrderStatus = 'abierta' | 'cuenta_solicitada' | 'pagada' | 'cancelada';
export type KitchenBatchStatus = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado';
export type TableStatus = 'libre' | 'ocupada' | 'cuenta_solicitada';
export type UserRole = 'admin' | 'mesonero' | 'cocina';

export interface AppUser {
  id: number; // Id Usuario correlativo automático (1, 2, 3, ...)
  name: string; // Nombre del usuario
  role: UserRole; // 'admin' | 'mesonero' | 'cocina'
  pin?: string; // PIN de acceso rápido (ej: 1234)
  active: boolean;
  createdAt: string;
}

export interface Waiter {
  id: string;
  name: string;
  code?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number; // Base price in USD ($)
  description: string;
  quickNotes?: string[];
  available: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number; // Unit price in USD
  quantity: number;
  notes: string;
  round: number;
  addedAt: string;
}

export interface KitchenTicketBatch {
  id: string;
  orderId: string;
  orderNumber: number;
  tableId: string;
  tableName: string;
  waiterName: string;
  round: number;
  isAddition: boolean;
  items: OrderItem[];
  createdAt: string;
  status: KitchenBatchStatus;
  printedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableId: string;
  tableName: string;
  waiterName: string;
  customerCount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  batches: KitchenTicketBatch[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  tipPercent: number;
  tipAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'transferencia' | 'pago_movil';
  paymentReference?: string;
  paidAt?: string;
  syncedToSheets?: boolean;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  activeOrderId?: string;
  zone?: string;
}

export type ThemeColor = 'amber' | 'emerald' | 'blue' | 'rose' | 'purple' | 'orange' | 'teal' | 'zinc';

export interface RestaurantSettings {
  restaurantName: string;
  currencySymbol: string;
  currencyCode: string;
  currencyBs?: string;
  bcvRate: number; // Tasa oficial del BCV (ej: 65.50 Bs / $)
  bcvLastUpdated?: string;
  taxPercent: number;
  defaultTipPercent: number;
  address: string;
  phone: string;
  receiptFooter: string;
  googleSheetsWebhookUrl: string;
  googleSheetsLastSync?: string;
  themeColor?: ThemeColor;
  headerStyle?: 'dark' | 'brand' | 'light';
}

export interface AppStateResponse {
  tables: Table[];
  orders: Order[];
  menu: MenuItem[];
  settings: RestaurantSettings;
  categories: string[];
  waiters: Waiter[];
  users: AppUser[];
}
