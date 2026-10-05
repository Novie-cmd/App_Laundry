import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  Employee,
  Expense,
  ProductInventory,
  Service,
  StockMovement,
  StoreSettings,
  Transaction,
  CashTransaction,
  CashShift,
  PaymentMethod,
  LaundryStatus,
  PaymentRecord,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_EXPENSES,
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_SETTINGS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_CASH_SHIFT,
} from '../data/mockData';
import { exportToCSV } from '../utils/formatters';

interface AppContextType {
  // Current user & Auth
  currentUser: Employee;
  switchUser: (employeeId: string) => void;
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Master Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>) => Customer;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Master Services
  services: Service[];
  addService: (srv: Omit<Service, 'id'>) => void;
  updateService: (id: string, srv: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  createTransaction: (trxData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: Transaction['items'];
    subtotal: number;
    discount: number;
    additionalFee: number;
    additionalFeeNote?: string;
    grandTotal: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    estimatedCompletionDate: string;
    notes: string;
    rackLocation: string;
  }) => Transaction;
  updateTransactionStatus: (id: string, newStatus: LaundryStatus) => void;
  addPaymentToTransaction: (
    transactionId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    notes?: string
  ) => void;
  deleteTransaction: (id: string) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Cash Management
  cashTransactions: CashTransaction[];
  cashShift: CashShift;
  addCashEntry: (entry: Omit<CashTransaction, 'id'>) => void;
  closeCurrentShift: (actualCash: number, note: string) => void;
  startNewShift: (startingCash: number) => void;

  // Inventory / Stock
  products: ProductInventory[];
  stockMovements: StockMovement[];
  addProduct: (product: Omit<ProductInventory, 'id'>) => void;
  updateProduct: (id: string, product: Partial<ProductInventory>) => void;
  deleteProduct: (id: string) => void;
  recordStockMovement: (
    productId: string,
    type: 'in' | 'out',
    quantity: number,
    reason: string
  ) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Modals & Popups
  receiptModalTrx: Transaction | null;
  setReceiptModalTrx: (trx: Transaction | null) => void;
  whatsappModalData: {
    trx: Transaction;
    type?: 'diterima' | 'diproses' | 'selesai' | 'belum_diambil' | 'tagihan_piutang';
  } | null;
  setWhatsappModalData: (
    data: {
      trx: Transaction;
      type?: 'diterima' | 'diproses' | 'selesai' | 'belum_diambil' | 'tagihan_piutang';
    } | null
  ) => void;
  quickPayModalTrx: Transaction | null;
  setQuickPayModalTrx: (trx: Transaction | null) => void;

  // Google Sheets Export & Sync
  syncStatus: { isSyncing: boolean; lastSyncTime: string | null; error: string | null };
  triggerGoogleSheetsSync: () => Promise<boolean>;
  exportSheetAsCSV: (sheetName: string) => void;
  exportAllSheetsAsCSV: () => void;

  // Computed KPIs
  stats: {
    todayOmzet: number;
    todayTransactionsCount: number;
    pendingOrdersCount: number;
    readyOrdersCount: number;
    totalReceivables: number;
    todayExpenses: number;
    todayProfit: number;
    lowStockCount: number;
    statusFunnel: Record<LaundryStatus, number>;
  };

  // Reset demo
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'freshwash_laundry_pos_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or fallback to mock data
  const loadInitialData = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [settings, setSettings] = useState<StoreSettings>(() =>
    loadInitialData('settings', INITIAL_SETTINGS)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadInitialData('employees', INITIAL_EMPLOYEES)
  );
  const [currentUser, setCurrentUser] = useState<Employee>(() => employees[0] || INITIAL_EMPLOYEES[0]);
  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadInitialData('customers', INITIAL_CUSTOMERS)
  );
  const [services, setServices] = useState<Service[]>(() =>
    loadInitialData('services', INITIAL_SERVICES)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadInitialData('transactions', INITIAL_TRANSACTIONS)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadInitialData('expenses', INITIAL_EXPENSES)
  );
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() =>
    loadInitialData('cash_tx', INITIAL_CASH_TRANSACTIONS)
  );
  const [cashShift, setCashShift] = useState<CashShift>(() =>
    loadInitialData('cash_shift', INITIAL_CASH_SHIFT)
  );
  const [products, setProducts] = useState<ProductInventory[]>(() =>
    loadInitialData('products', INITIAL_PRODUCTS)
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    loadInitialData('stock_movements', INITIAL_STOCK_MOVEMENTS)
  );

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(settings));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_employees`, JSON.stringify(employees));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_services`, JSON.stringify(services));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expenses`, JSON.stringify(expenses));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_cash_tx`, JSON.stringify(cashTransactions));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_cash_shift`, JSON.stringify(cashShift));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_stock_movements`, JSON.stringify(stockMovements));
  }, [settings, employees, customers, services, transactions, expenses, cashTransactions, cashShift, products, stockMovements]);

  // Modals state
  const [receiptModalTrx, setReceiptModalTrx] = useState<Transaction | null>(null);
  const [whatsappModalData, setWhatsappModalData] = useState<{
    trx: Transaction;
    type?: 'diterima' | 'diproses' | 'selesai' | 'belum_diambil' | 'tagihan_piutang';
  } | null>(null);
  const [quickPayModalTrx, setQuickPayModalTrx] = useState<Transaction | null>(null);

  // Google Sheets sync state
  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    lastSyncTime: string | null;
    error: string | null;
  }>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
  });

  // Switch User
  const switchUser = (employeeId: string) => {
    const found = employees.find((e) => e.id === employeeId);
    if (found) setCurrentUser(found);
  };

  // Employee CRUD
  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...emp,
      id: `EMP-00${employees.length + 1}`,
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...emp } : e)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...emp }));
    }
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Customers CRUD
  const addCustomer = (cust: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>): Customer => {
    const newId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...cust,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, cust: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...cust } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Services CRUD
  const addService = (srv: Omit<Service, 'id'>) => {
    const newId = `SRV-${String(services.length + 1).padStart(3, '0')}`;
    setServices((prev) => [...prev, { ...srv, id: newId }]);
  };

  const updateService = (id: string, srv: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...srv } : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Create Transaction
  const createTransaction = (trxData: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: Transaction['items'];
    subtotal: number;
    discount: number;
    additionalFee: number;
    additionalFeeNote?: string;
    grandTotal: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    estimatedCompletionDate: string;
    notes: string;
    rackLocation: string;
  }): Transaction => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    const invoicePrefix = `TRX-${dateStr.replace(/-/g, '')}-`;
    const todayTrxCount =
      transactions.filter((t) => t.invoiceNumber.startsWith(invoicePrefix)).length + 1;
    const invoiceNumber = `${invoicePrefix}${String(todayTrxCount).padStart(3, '0')}`;

    const remaining = Math.max(0, trxData.grandTotal - trxData.paidAmount);
    let paymentStatus: Transaction['paymentStatus'] = 'belum_lunas';
    if (trxData.paidAmount >= trxData.grandTotal) {
      paymentStatus = 'lunas';
    } else if (trxData.paidAmount > 0) {
      paymentStatus = 'dp';
    }

    const payments: PaymentRecord[] = [];
    if (trxData.paidAmount > 0) {
      payments.push({
        id: `PAY-${Date.now()}`,
        transactionId: invoiceNumber,
        invoiceNumber,
        customerName: trxData.customerName,
        amount: trxData.paidAmount,
        paymentMethod: trxData.paymentMethod,
        type: paymentStatus === 'lunas' ? 'penuh' : 'dp',
        date: `${dateStr} ${timeStr}`,
        cashierName: currentUser.name,
        notes: paymentStatus === 'dp' ? 'Uang Muka (DP)' : 'Pembayaran Penuh',
      });
    }

    const newTrx: Transaction = {
      id: invoiceNumber,
      invoiceNumber,
      customerId: trxData.customerId,
      customerName: trxData.customerName,
      customerPhone: trxData.customerPhone,
      date: `${dateStr} ${timeStr}`,
      estimatedCompletionDate: trxData.estimatedCompletionDate,
      items: trxData.items,
      subtotal: trxData.subtotal,
      discount: trxData.discount,
      additionalFee: trxData.additionalFee,
      additionalFeeNote: trxData.additionalFeeNote,
      grandTotal: trxData.grandTotal,
      paidAmount: trxData.paidAmount,
      remainingAmount: remaining,
      paymentMethod: trxData.paymentMethod,
      paymentStatus,
      status: 'diterima',
      notes: trxData.notes,
      rackLocation: trxData.rackLocation || 'Front Desk',
      cashierName: currentUser.name,
      cashierId: currentUser.id,
      payments,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setTransactions((prev) => [newTrx, ...prev]);

    // Update customer stats
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === trxData.customerId
          ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + trxData.grandTotal,
            }
          : c
      )
    );

    // If paid with Cash, automatically record into Cash Shift & Cash Transactions
    if (trxData.paidAmount > 0 && trxData.paymentMethod === 'tunai') {
      const cashEntry: CashTransaction = {
        id: `CSH-${Date.now()}`,
        date: `${dateStr} ${timeStr}`,
        type: 'masuk',
        category: paymentStatus === 'dp' ? 'Pemasukan Laundry (DP)' : 'Pemasukan Laundry (Lunas)',
        amount: trxData.paidAmount,
        description: `Nota ${invoiceNumber} a.n ${trxData.customerName}`,
        referenceId: invoiceNumber,
        cashierName: currentUser.name,
      };
      setCashTransactions((prev) => [cashEntry, ...prev]);
      setCashShift((prev) => ({
        ...prev,
        laundryIncomeCash: prev.laundryIncomeCash + trxData.paidAmount,
        expectedCash: prev.expectedCash + trxData.paidAmount,
      }));
    }

    return newTrx;
  };

  // Update Laundry Status
  const updateTransactionStatus = (id: string, newStatus: LaundryStatus) => {
    const now = new Date().toISOString();
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id || t.invoiceNumber === id) {
          const completedAt =
            newStatus === 'selesai' || newStatus === 'siap_diambil'
              ? t.completedAt || now
              : t.completedAt;
          const pickedUpAt = newStatus === 'selesai' ? now : t.pickedUpAt;
          return {
            ...t,
            status: newStatus,
            completedAt,
            pickedUpAt,
            updatedAt: now,
          };
        }
        return t;
      })
    );
  };

  // Add Payment / Settle Receivable
  const addPaymentToTransaction = (
    transactionId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    notes?: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId || t.invoiceNumber === transactionId) {
          const newPaid = t.paidAmount + amount;
          const newRemaining = Math.max(0, t.grandTotal - newPaid);
          const newStatus: Transaction['paymentStatus'] =
            newRemaining === 0 ? 'lunas' : 'dp';

          const newPayment: PaymentRecord = {
            id: `PAY-${Date.now()}`,
            transactionId: t.id,
            invoiceNumber: t.invoiceNumber,
            customerName: t.customerName,
            amount,
            paymentMethod,
            type: newRemaining === 0 ? 'pelunasan' : 'dp',
            date: `${dateStr} ${timeStr}`,
            cashierName: currentUser.name,
            notes: notes || (newRemaining === 0 ? 'Pelunasan Tagihan' : 'Pembayaran Cicilan'),
          };

          return {
            ...t,
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            paymentStatus: newStatus,
            payments: [...t.payments, newPayment],
            updatedAt: now.toISOString(),
          };
        }
        return t;
      })
    );

    // If paid with Cash, update cash drawer & cash transaction
    if (paymentMethod === 'tunai') {
      const targetTrx = transactions.find(
        (t) => t.id === transactionId || t.invoiceNumber === transactionId
      );
      const cashEntry: CashTransaction = {
        id: `CSH-${Date.now()}`,
        date: `${dateStr} ${timeStr}`,
        type: 'masuk',
        category: 'Pelunasan Piutang Laundry',
        amount,
        description: `Pelunasan ${targetTrx?.invoiceNumber || transactionId} a.n ${targetTrx?.customerName || ''}`,
        referenceId: targetTrx?.invoiceNumber || transactionId,
        cashierName: currentUser.name,
      };
      setCashTransactions((prev) => [cashEntry, ...prev]);
      setCashShift((prev) => ({
        ...prev,
        laundryIncomeCash: prev.laundryIncomeCash + amount,
        expectedCash: prev.expectedCash + amount,
      }));
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id && t.invoiceNumber !== id));
  };

  // Expenses CRUD
  const addExpense = (exp: Omit<Expense, 'id'>) => {
    const newId = `EXP-${Date.now()}`;
    const newExpense: Expense = {
      ...exp,
      id: newId,
      recordedBy: exp.recordedBy || currentUser.name,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // If paid cash, log to cash drawer
    if (exp.paymentMethod === 'tunai') {
      const cashEntry: CashTransaction = {
        id: `CSH-${Date.now()}`,
        date: exp.date,
        type: 'keluar',
        category: `Pengeluaran: ${exp.category}`,
        amount: exp.amount,
        description: exp.description,
        referenceId: newId,
        cashierName: currentUser.name,
      };
      setCashTransactions((prev) => [cashEntry, ...prev]);
      setCashShift((prev) => ({
        ...prev,
        expensesCash: prev.expensesCash + exp.amount,
        expectedCash: prev.expectedCash - exp.amount,
      }));
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Cash Management
  const addCashEntry = (entry: Omit<CashTransaction, 'id'>) => {
    const newEntry: CashTransaction = {
      ...entry,
      id: `CSH-${Date.now()}`,
      cashierName: entry.cashierName || currentUser.name,
    };
    setCashTransactions((prev) => [newEntry, ...prev]);

    setCashShift((prev) => {
      const delta = entry.type === 'masuk' ? entry.amount : -entry.amount;
      return {
        ...prev,
        otherIncomeCash:
          entry.type === 'masuk' ? prev.otherIncomeCash + entry.amount : prev.otherIncomeCash,
        expectedCash: prev.expectedCash + delta,
      };
    });
  };

  const closeCurrentShift = (actualCash: number, note: string) => {
    const diff = actualCash - cashShift.expectedCash;
    setCashShift((prev) => ({
      ...prev,
      actualCash,
      difference: diff,
      note,
      closedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isClosed: true,
    }));
  };

  const startNewShift = (startingCash: number) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newShift: CashShift = {
      id: `SHIFT-${Date.now()}`,
      date: dateStr,
      openedAt: `${dateStr} ${timeStr}`,
      startingCash,
      laundryIncomeCash: 0,
      otherIncomeCash: 0,
      expensesCash: 0,
      expectedCash: startingCash,
      cashierName: currentUser.name,
      isClosed: false,
    };
    setCashShift(newShift);

    // Record cash transaction
    addCashEntry({
      date: `${dateStr} ${timeStr}`,
      type: 'masuk',
      category: 'Saldo Awal Shift',
      amount: startingCash,
      description: `Modal kas shift baru kasir ${currentUser.name}`,
      cashierName: currentUser.name,
    });
  };

  // Inventory & Stock
  const addProduct = (prod: Omit<ProductInventory, 'id'>) => {
    const newProduct: ProductInventory = {
      ...prod,
      id: `PRD-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, prod: Partial<ProductInventory>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...prod } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const recordStockMovement = (
    productId: string,
    type: 'in' | 'out',
    quantity: number,
    reason: string
  ) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const newStock =
      type === 'in' ? target.currentStock + quantity : Math.max(0, target.currentStock - quantity);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentStock: newStock } : p))
    );

    const now = new Date();
    const movement: StockMovement = {
      id: `SM-${Date.now()}`,
      productId,
      productName: target.name,
      type,
      quantity,
      date: `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`,
      reason,
      recordedBy: currentUser.name,
    };
    setStockMovements((prev) => [movement, ...prev]);
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Google Sheets Sync
  const triggerGoogleSheetsSync = async (): Promise<boolean> => {
    setSyncStatus({ isSyncing: true, lastSyncTime: null, error: null });
    try {
      if (settings.googleScriptUrl) {
        // Post data payload to user's Google Apps Script Web App
        const payload = {
          customers,
          services,
          transactions,
          expenses,
          cashTransactions,
          products,
          timestamp: new Date().toISOString(),
        };
        await fetch(settings.googleScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script web apps often redirect with CORS
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Simulated local synchronization with Google Spreadsheet model
        await new Promise((r) => setTimeout(r, 900));
      }
      setSyncStatus({
        isSyncing: false,
        lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        error: null,
      });
      return true;
    } catch (err: any) {
      setSyncStatus({
        isSyncing: false,
        lastSyncTime: null,
        error: err.message || 'Gagal menyinkronkan dengan Google Sheets',
      });
      return false;
    }
  };

  // Export to CSV helper
  const exportSheetAsCSV = (sheetName: string) => {
    switch (sheetName) {
      case 'transactions': {
        const rows = [
          ['No Invoice', 'Tanggal', 'Pelanggan', 'No HP', 'Layanan', 'Grand Total', 'Bayar', 'Sisa', 'Metode', 'Status Bayar', 'Status Laundry', 'Kasir', 'Lokasi Rak'],
          ...transactions.map((t) => [
            t.invoiceNumber,
            t.date,
            t.customerName,
            t.customerPhone,
            t.items.map((i) => `${i.serviceName} (${i.quantity} ${i.unit})`).join('; '),
            t.grandTotal,
            t.paidAmount,
            t.remainingAmount,
            t.paymentMethod.toUpperCase(),
            t.paymentStatus.toUpperCase(),
            t.status.toUpperCase(),
            t.cashierName,
            t.rackLocation,
          ]),
        ];
        exportToCSV('transactions_laundry', rows);
        break;
      }
      case 'customers': {
        const rows = [
          ['ID Pelanggan', 'Nama', 'No HP', 'Alamat', 'Catatan', 'Total Order', 'Total Transaksi (Rp)', 'Tgl Gabung'],
          ...customers.map((c) => [c.id, c.name, c.phone, c.address, c.notes, c.totalOrders, c.totalSpent, c.createdAt]),
        ];
        exportToCSV('customers_master', rows);
        break;
      }
      case 'services': {
        const rows = [
          ['ID Layanan', 'Nama Layanan', 'Kategori', 'Harga', 'Satuan', 'Estimasi (Jam)', 'Status Aktif', 'Deskripsi'],
          ...services.map((s) => [s.id, s.name, s.category, s.price, s.unit, s.estimateHours, s.active ? 'Aktif' : 'Nonaktif', s.description]),
        ];
        exportToCSV('services_master', rows);
        break;
      }
      case 'expenses': {
        const rows = [
          ['ID', 'Tanggal', 'Kategori', 'Jumlah (Rp)', 'Keterangan', 'Metode Bayar', 'Dicatat Oleh'],
          ...expenses.map((e) => [e.id, e.date, e.category, e.amount, e.description, e.paymentMethod, e.recordedBy]),
        ];
        exportToCSV('expenses_laundry', rows);
        break;
      }
      case 'cash_transactions': {
        const rows = [
          ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Nominal (Rp)', 'Keterangan', 'Ref No', 'Kasir'],
          ...cashTransactions.map((c) => [c.id, c.date, c.type.toUpperCase(), c.category, c.amount, c.description, c.referenceId || '', c.cashierName]),
        ];
        exportToCSV('cash_transactions', rows);
        break;
      }
      case 'products': {
        const rows = [
          ['Kode', 'Nama Bahan/Barang', 'Kategori', 'Satuan', 'Stok Saat Ini', 'Stok Min', 'Harga Beli (Rp)', 'Restock Terakhir'],
          ...products.map((p) => [p.code, p.name, p.category, p.unit, p.currentStock, p.minStock, p.buyPrice, p.lastRestockDate]),
        ];
        exportToCSV('products_inventory', rows);
        break;
      }
      default:
        break;
    }
  };

  const exportAllSheetsAsCSV = () => {
    ['transactions', 'customers', 'services', 'expenses', 'cash_transactions', 'products'].forEach((sheet) => {
      exportSheetAsCSV(sheet);
    });
  };

  const resetDemoData = () => {
    localStorage.clear();
    setSettings(INITIAL_SETTINGS);
    setEmployees(INITIAL_EMPLOYEES);
    setCurrentUser(INITIAL_EMPLOYEES[0]);
    setCustomers(INITIAL_CUSTOMERS);
    setServices(INITIAL_SERVICES);
    setTransactions(INITIAL_TRANSACTIONS);
    setExpenses(INITIAL_EXPENSES);
    setCashTransactions(INITIAL_CASH_TRANSACTIONS);
    setCashShift(INITIAL_CASH_SHIFT);
    setProducts(INITIAL_PRODUCTS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
  };

  // KPI calculations
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTransactions = transactions.filter((t) => t.date.startsWith(todayStr));

  // Today omzet = sum of all payments received today
  const todayPayments = transactions.flatMap((t) => t.payments).filter((p) => p.date.startsWith(todayStr));
  const todayOmzet = todayPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const todayExpensesAmount = expenses
    .filter((e) => e.date.startsWith(todayStr))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingOrdersCount = transactions.filter(
    (t) => t.status !== 'selesai' && t.status !== 'siap_diambil'
  ).length;

  const readyOrdersCount = transactions.filter((t) => t.status === 'siap_diambil').length;

  const totalReceivables = transactions
    .filter((t) => t.paymentStatus !== 'lunas')
    .reduce((acc, curr) => acc + curr.remainingAmount, 0);

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const statusFunnel: Record<LaundryStatus, number> = {
    diterima: transactions.filter((t) => t.status === 'diterima').length,
    dicuci: transactions.filter((t) => t.status === 'dicuci').length,
    dikeringkan: transactions.filter((t) => t.status === 'dikeringkan').length,
    disetrika: transactions.filter((t) => t.status === 'disetrika').length,
    siap_diambil: transactions.filter((t) => t.status === 'siap_diambil').length,
    selesai: transactions.filter((t) => t.status === 'selesai').length,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        services,
        addService,
        updateService,
        deleteService,
        transactions,
        createTransaction,
        updateTransactionStatus,
        addPaymentToTransaction,
        deleteTransaction,
        expenses,
        addExpense,
        deleteExpense,
        cashTransactions,
        cashShift,
        addCashEntry,
        closeCurrentShift,
        startNewShift,
        products,
        stockMovements,
        addProduct,
        updateProduct,
        deleteProduct,
        recordStockMovement,
        settings,
        updateSettings,
        receiptModalTrx,
        setReceiptModalTrx,
        whatsappModalData,
        setWhatsappModalData,
        quickPayModalTrx,
        setQuickPayModalTrx,
        syncStatus,
        triggerGoogleSheetsSync,
        exportSheetAsCSV,
        exportAllSheetsAsCSV,
        stats: {
          todayOmzet,
          todayTransactionsCount: todayTransactions.length,
          pendingOrdersCount,
          readyOrdersCount,
          totalReceivables,
          todayExpenses: todayExpensesAmount,
          todayProfit: todayOmzet - todayExpensesAmount,
          lowStockCount,
          statusFunnel,
        },
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
