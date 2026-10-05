export type Role = 'owner' | 'admin' | 'kasir' | 'operator';

export interface Employee {
  id: string;
  name: string;
  role: Role;
  position: string;
  username: string;
  password?: string;
  phone: string;
  active: boolean;
}

export interface Customer {
  id: string; // e.g. CUST-001
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export type ServiceCategory = 'kiloan' | 'satuan' | 'express' | 'setrika' | 'custom';
export type ServiceUnit = 'kg' | 'pcs' | 'meter' | 'pasang';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  unit: ServiceUnit;
  estimateHours: number;
  active: boolean;
  description: string;
}

export interface TransactionItem {
  id: string;
  serviceId: string;
  serviceName: string;
  unit: ServiceUnit;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export type PaymentMethod = 'tunai' | 'transfer' | 'qris' | 'ewallet';
export type PaymentStatus = 'lunas' | 'belum_lunas' | 'dp';
export type LaundryStatus = 'diterima' | 'dicuci' | 'dikeringkan' | 'disetrika' | 'siap_diambil' | 'selesai';

export interface PaymentRecord {
  id: string;
  transactionId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  type: 'dp' | 'pelunasan' | 'penuh';
  date: string;
  cashierName: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string; // e.g. TRX-20261005-001
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string; // ISO
  estimatedCompletionDate: string; // ISO
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  additionalFee: number;
  additionalFeeNote?: string;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: LaundryStatus;
  notes: string;
  rackLocation: string;
  cashierName: string;
  cashierId: string;
  payments: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  pickedUpAt?: string;
}

export type ExpenseCategory =
  | 'Detergen'
  | 'Plastik'
  | 'Pewangi'
  | 'Listrik'
  | 'Air'
  | 'Gaji'
  | 'Sewa'
  | 'Transportasi'
  | 'Perawatan Mesin'
  | 'Lainnya';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  recordedBy: string;
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'masuk' | 'keluar';
  category: string;
  amount: number;
  description: string;
  referenceId?: string;
  cashierName: string;
}

export interface CashShift {
  id: string;
  date: string;
  openedAt: string;
  closedAt?: string;
  startingCash: number;
  laundryIncomeCash: number;
  otherIncomeCash: number;
  expensesCash: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  note?: string;
  cashierName: string;
  isClosed: boolean;
}

export interface ProductInventory {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  buyPrice: number;
  lastRestockDate: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
  recordedBy: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  headerNote: string;
  footerNote: string;
  termsNote: string;
  thermalWidth: '58mm' | '80mm';
  qrisImageUrl?: string;
  bankAccountInfo: string;
  googleSheetId: string;
  googleScriptUrl: string;
  autoSyncGoogleSheets: boolean;
}
