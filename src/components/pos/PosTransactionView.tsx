import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Service, ServiceCategory, TransactionItem, PaymentMethod } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  User,
  Plus,
  Trash2,
  Calculator,
  Printer,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  Tag,
  Package,
} from 'lucide-react';

export const PosTransactionView: React.FC = () => {
  const {
    customers,
    services,
    addCustomer,
    createTransaction,
    setReceiptModalTrx,
    setWhatsappModalData,
    settings,
  } = useApp();

  // Selected or new customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // Cart / Items
  const [cartItems, setCartItems] = useState<TransactionItem[]>([
    {
      id: 'item-1',
      serviceId: services[0]?.id || 'SRV-001',
      serviceName: services[0]?.name || 'Cuci + Setrika Reguler',
      unit: services[0]?.unit || 'kg',
      price: services[0]?.price || 8000,
      quantity: 5,
      subtotal: (services[0]?.price || 8000) * 5,
      notes: '',
    },
  ]);

  // Service filter tab in service picker
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');

  // Pricing adjustments
  const [discount, setDiscount] = useState<number>(0);
  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [additionalFeeNote, setAdditionalFeeNote] = useState<string>('');

  // Payment details
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [rackLocation, setRackLocation] = useState<string>('A-01');
  const [notes, setNotes] = useState<string>('');

  // Date & Estimation
  const now = new Date();
  const defaultEstimate = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const [estimatedDate, setEstimatedDate] = useState<string>(defaultEstimate);

  // Calculations
  const subtotal = cartItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const grandTotal = Math.max(0, subtotal - discount + additionalFee);
  const effectivePaid = paidAmount;
  const changeAmount = Math.max(0, effectivePaid - grandTotal);
  const remainingDebt = Math.max(0, grandTotal - effectivePaid);

  // Selected customer object
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || {
    id: 'CUST-WALK',
    name: 'Pelanggan Umum (Walk-in)',
    phone: '',
    address: '',
    notes: '',
    createdAt: '',
    totalOrders: 0,
    totalSpent: 0,
  };

  // Add item from catalog to cart
  const handleAddServiceToCart = (service: Service) => {
    // If already in cart, increment quantity
    const existingIndex = cartItems.findIndex((i) => i.serviceId === service.id);
    if (existingIndex >= 0) {
      const updated = [...cartItems];
      const item = updated[existingIndex];
      const newQty = item.quantity + 1;
      updated[existingIndex] = {
        ...item,
        quantity: newQty,
        subtotal: newQty * item.price,
      };
      setCartItems(updated);
    } else {
      const newItem: TransactionItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        serviceId: service.id,
        serviceName: service.name,
        unit: service.unit,
        price: service.price,
        quantity: 1,
        subtotal: service.price,
        notes: '',
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  // Update item quantity or notes in cart
  const handleUpdateItemQty = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...cartItems];
    updated[index] = {
      ...updated[index],
      quantity,
      subtotal: Math.round(quantity * updated[index].price),
    };
    setCartItems(updated);
  };

  const handleUpdateItemNotes = (index: number, itemNotes: string) => {
    const updated = [...cartItems];
    updated[index] = { ...updated[index], notes: itemNotes };
    setCartItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Quick cash buttons
  const handleQuickPayPreset = (amount: number) => {
    setPaidAmount(amount);
  };

  // Create new customer fast
  const handleSaveQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const created = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress,
      notes: newCustNotes,
    });

    setSelectedCustomerId(created.id);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustNotes('');
  };

  // Submit complete order
  const handleCompleteTransaction = (withPrint = true) => {
    if (cartItems.length === 0) {
      alert('Pilih minimal satu layanan laundry terlebih dahulu!');
      return;
    }

    const createdTrx = createTransaction({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      items: cartItems,
      subtotal,
      discount,
      additionalFee,
      additionalFeeNote,
      grandTotal,
      paidAmount: effectivePaid,
      paymentMethod,
      estimatedCompletionDate: estimatedDate.replace('T', ' '),
      notes,
      rackLocation,
    });

    // Open receipt modal automatically
    if (withPrint) {
      setReceiptModalTrx(createdTrx);
    }

    // Reset Form for next customer
    setCartItems([
      {
        id: `item-${Date.now()}`,
        serviceId: services[0]?.id || 'SRV-001',
        serviceName: services[0]?.name || 'Cuci + Setrika Reguler',
        unit: services[0]?.unit || 'kg',
        price: services[0]?.price || 8000,
        quantity: 3,
        subtotal: (services[0]?.price || 8000) * 3,
        notes: '',
      },
    ]);
    setDiscount(0);
    setAdditionalFee(0);
    setAdditionalFeeNote('');
    setPaidAmount(0);
    setNotes('');
  };

  const filteredServices = services.filter((s) => {
    if (!s.active) return false;
    if (serviceCategoryFilter === 'all') return true;
    return s.category === serviceCategoryFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 2-Column POS Cashier Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Customer & Service Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step 1: Customer Selector & Quick Add */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-slate-900">Pilih / Cari Pelanggan</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-xl border border-cyan-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Pelanggan Baru
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Pilih dari Master Pelanggan:
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'No HP -'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer info card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>{currentCustomer.name}</span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">
                    {currentCustomer.id}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  HP: {currentCustomer.phone || '-'}
                </div>
                {currentCustomer.notes && (
                  <div className="text-amber-700 text-[10px] italic mt-1 bg-amber-50 px-1.5 py-0.5 rounded">
                    Catatan: {currentCustomer.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Layanan Laundry Catalog */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-slate-900">Katalog Layanan & Tarif</h3>
              </div>

              {/* Category tabs */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs overflow-x-auto">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'kiloan', label: 'Kiloan' },
                  { id: 'satuan', label: 'Satuan' },
                  { id: 'express', label: 'Express' },
                  { id: 'setrika', label: 'Setrika' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setServiceCategoryFilter(tab.id)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      serviceCategoryFilter === tab.id
                        ? 'bg-white text-cyan-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Service grid cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => handleAddServiceToCart(srv)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-900 line-clamp-1">
                        {srv.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {srv.description}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-cyan-600 text-xs">
                      {formatRupiah(srv.price)}
                      <span className="text-[10px] font-normal text-slate-400">/{srv.unit}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {srv.estimateHours}j
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Timbangan & Daftar Item Keranjang */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Item Cucian ({cartItems.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">Timbang / masukkan jumlah per item</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                Keranjang cucian masih kosong. Klik layanan pada katalog di atas untuk menambahkan.
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{item.serviceName}</span>
                        <div className="text-[11px] text-slate-500">
                          {formatRupiah(item.price)} per {item.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center pt-1 border-t border-slate-200/60">
                      {/* Quantity / Weight Input */}
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] font-semibold text-slate-600">
                          {item.unit === 'kg' ? 'Berat (Kg):' : 'Jumlah:'}
                        </label>
                        <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, Math.max(0.5, item.quantity - 0.5))}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step={item.unit === 'kg' ? '0.1' : '1'}
                            min="0.1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQty(index, parseFloat(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 text-center font-bold text-xs text-slate-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(index, item.quantity + 0.5)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Notes / Special request per item */}
                      <div>
                        <input
                          type="text"
                          placeholder="Catatan pakaian (noda/luntur/hanger)..."
                          value={item.notes || ''}
                          onChange={(e) => handleUpdateItemNotes(index, e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right font-extrabold text-sm text-cyan-700">
                        {formatRupiah(item.subtotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary, Payment & Struk Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 sticky top-20">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="font-bold text-sm text-slate-900">Perhitungan & Pembayaran</h3>
            </div>

            {/* Calculations Box */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Item</span>
                <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-slate-600 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Diskon Potongan (Rp)
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={discount || ''}
                  placeholder="0"
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-28 px-2 py-1 text-right bg-slate-50 border border-slate-300 rounded-lg font-semibold text-xs focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Additional Fee Input */}
              <div className="flex items-center justify-between gap-2">
                <div className="text-slate-600">
                  <span>Biaya Tambahan</span>
                  <input
                    type="text"
                    placeholder="Alasan (misal Express/Antar)"
                    value={additionalFeeNote}
                    onChange={(e) => setAdditionalFeeNote(e.target.value)}
                    className="block text-[10px] text-slate-500 mt-0.5 px-1 py-0.5 border border-slate-200 rounded w-28"
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={additionalFee || ''}
                  placeholder="0"
                  onChange={(e) => setAdditionalFee(Number(e.target.value))}
                  className="w-28 px-2 py-1 text-right bg-slate-50 border border-slate-300 rounded-lg font-semibold text-xs focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Grand Total */}
              <div className="p-3 bg-gradient-to-r from-cyan-900 to-slate-900 rounded-xl text-white flex items-center justify-between mt-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-cyan-300 font-semibold">
                    TOTAL TAGIHAN
                  </div>
                  <div className="text-xl font-extrabold tracking-tight">
                    {formatRupiah(grandTotal)}
                  </div>
                </div>
                <Calculator className="w-6 h-6 text-cyan-400 opacity-80" />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'tunai', label: 'Tunai (Cash)', icon: Banknote },
                  { id: 'qris', label: 'QRIS', icon: QrCode },
                  { id: 'transfer', label: 'Transfer Bank', icon: CreditCard },
                  { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                        paymentMethod === m.id
                          ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold ring-1 ring-cyan-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-cyan-600" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paid Amount Input & Quick Preset Buttons */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Uang Dibayar (Rp)
                </label>
                <span className="text-[11px] text-slate-500">
                  {effectivePaid >= grandTotal
                    ? 'Status: LUNAS'
                    : effectivePaid > 0
                    ? 'Status: UANG MUKA (DP)'
                    : 'Status: BELUM LUNAS'}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={paidAmount || ''}
                  placeholder="0 (Bayar Nanti)"
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Quick Cash Suggestions */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPayPreset(grandTotal)}
                  className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold rounded-lg text-[11px] border border-cyan-200"
                >
                  Uang Pas ({formatRupiah(grandTotal)})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayPreset(Math.round(grandTotal / 2))}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg text-[11px] border border-amber-200"
                >
                  DP 50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayPreset(50000)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[11px]"
                >
                  50.000
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayPreset(100000)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-[11px]"
                >
                  100.000
                </button>
              </div>

              {/* Kembalian / Piutang status indicator */}
              {changeAmount > 0 && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex justify-between items-center text-emerald-800 font-semibold">
                  <span>Kembalian Kasir:</span>
                  <span className="text-sm font-extrabold">{formatRupiah(changeAmount)}</span>
                </div>
              )}
              {remainingDebt > 0 && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs flex justify-between items-center text-rose-800 font-semibold">
                  <span>Sisa Tagihan (Piutang):</span>
                  <span className="text-sm font-extrabold">{formatRupiah(remainingDebt)}</span>
                </div>
              )}
            </div>

            {/* Estimation & Rack Location */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Estimasi Selesai:</label>
                <input
                  type="datetime-local"
                  value={estimatedDate}
                  onChange={(e) => setEstimatedDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Nomor / Rak:</label>
                <input
                  type="text"
                  placeholder="Contoh: Rak A-02"
                  value={rackLocation}
                  onChange={(e) => setRackLocation(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <input
                type="text"
                placeholder="Catatan transaksi (opsional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Complete Transaction Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleCompleteTransaction(true)}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Printer className="w-4 h-4" />
                Simpan & Cetak Struk (Thermal)
              </button>

              <button
                type="button"
                onClick={() => handleCompleteTransaction(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Simpan Pesanan Saja (Tanpa Struk)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Pelanggan Cepat */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">Tambah Pelanggan Baru Cepat</h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickCustomer} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. WhatsApp / HP *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Mawar No. 10"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pelanggan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Suka wangi lavender, jangan dilipat"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-sm"
                >
                  Simpan & Pilih Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
