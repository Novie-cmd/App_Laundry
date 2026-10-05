import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { ProductInventory } from '../../types';
import {
  Package,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  History,
  Download,
  Trash2,
  Edit,
  CheckCircle2,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    stockMovements,
    addProduct,
    updateProduct,
    deleteProduct,
    recordStockMovement,
    exportSheetAsCSV,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState<{
    product: ProductInventory;
    type: 'in' | 'out';
  } | null>(null);

  // Form states for stock adjustment
  const [stockQuantity, setStockQuantity] = useState<number>(1);
  const [stockReason, setStockReason] = useState('');

  // Form states for new product
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Bahan Kimia');
  const [prodUnit, setProdUnit] = useState('Jerigen 5L');
  const [prodStock, setProdStock] = useState<number>(5);
  const [prodMinStock, setProdMinStock] = useState<number>(2);
  const [prodBuyPrice, setProdBuyPrice] = useState<number>(50000);

  const lowStockItems = products.filter((p) => p.currentStock <= p.minStock);

  const handleStockAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStockModal || stockQuantity <= 0) return;

    recordStockMovement(
      showStockModal.product.id,
      showStockModal.type,
      stockQuantity,
      stockReason || (showStockModal.type === 'in' ? 'Restock bahan' : 'Pemakaian operasional laundry')
    );

    setShowStockModal(null);
    setStockQuantity(1);
    setStockReason('');
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const now = new Date().toISOString().split('T')[0];

    addProduct({
      code: prodCode || `PRD-${Date.now().toString().slice(-4)}`,
      name: prodName,
      category: prodCategory,
      unit: prodUnit,
      currentStock: prodStock,
      minStock: prodMinStock,
      buyPrice: prodBuyPrice,
      lastRestockDate: now,
    });

    setShowAddProductModal(false);
    setProdCode('');
    setProdName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Alert if low stock exists */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                Peringatan: {lowStockItems.length} Bahan Operasional Sudah Menipis!
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {lowStockItems.map((p) => `${p.name} (Sisa ${p.currentStock} ${p.unit})`).join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Stok Bahan ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'movements'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Mutasi Stok ({stockMovements.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSheetAsCSV('products')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Bahan / Produk
          </button>
        </div>
      </div>

      {/* TAB 1: DAFTAR STOK */}
      {activeTab === 'inventory' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Kode</th>
                  <th className="px-5 py-3.5 font-semibold">Nama Bahan / Barang</th>
                  <th className="px-5 py-3.5 font-semibold">Kategori</th>
                  <th className="px-5 py-3.5 font-semibold">Stok Saat Ini</th>
                  <th className="px-5 py-3.5 font-semibold">Batas Min</th>
                  <th className="px-5 py-3.5 font-semibold">Harga Beli</th>
                  <th className="px-5 py-3.5 font-semibold">Status Stok</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Mutasi / Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const isLow = prod.currentStock <= prod.minStock;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-500 font-semibold">
                        {prod.code}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-[11px] text-slate-500">Satuan: {prod.unit}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{prod.category}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {prod.currentStock}
                        </span>{' '}
                        <span className="text-[11px] text-slate-500">{prod.unit}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{prod.minStock}</td>
                      <td className="px-5 py-3.5 text-slate-800 font-semibold">
                        {formatRupiah(prod.buyPrice)}
                      </td>
                      <td className="px-5 py-3.5">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Stok Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Stok Aman
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setShowStockModal({ product: prod, type: 'in' })}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                            title="Restock / Stok Masuk"
                          >
                            <ArrowDownLeft className="w-3 h-3" />
                            Masuk
                          </button>
                          <button
                            onClick={() => setShowStockModal({ product: prod, type: 'out' })}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                            title="Pemakaian / Stok Keluar"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            Keluar
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: RIWAYAT MUTASI */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Tgl & Jam</th>
                  <th className="px-5 py-3.5 font-semibold">Nama Barang</th>
                  <th className="px-5 py-3.5 font-semibold">Jenis Mutasi</th>
                  <th className="px-5 py-3.5 font-semibold">Jumlah</th>
                  <th className="px-5 py-3.5 font-semibold">Alasan / Keterangan</th>
                  <th className="px-5 py-3.5 font-semibold">Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-slate-600">{sm.date}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{sm.productName}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          sm.type === 'in'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sm.type === 'in' ? '+' : '-'} {sm.type === 'in' ? 'Stok Masuk' : 'Stok Keluar'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{sm.quantity}</td>
                    <td className="px-5 py-3.5 text-slate-600">{sm.reason}</td>
                    <td className="px-5 py-3.5 text-slate-600">{sm.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Input Stok Masuk / Keluar */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">
                {showStockModal.type === 'in' ? 'Restock / Stok Masuk' : 'Catat Pemakaian Stok Keluar'}
              </h3>
              <button
                onClick={() => setShowStockModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 text-sm">
                  {showStockModal.product.name}
                </div>
                <div className="text-slate-500 mt-0.5">
                  Stok saat ini: <b>{showStockModal.product.currentStock}</b> {showStockModal.product.unit}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah {showStockModal.type === 'in' ? 'Masuk (+)' : 'Keluar (-)'} (
                  {showStockModal.product.unit}) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan
                </label>
                <input
                  type="text"
                  placeholder={
                    showStockModal.type === 'in'
                      ? 'Contoh: Beli di toko bahan kimia grosir'
                      : 'Contoh: Pemakaian harian setrika & packing'
                  }
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs ${
                    showStockModal.type === 'in'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Bahan Baru */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">Tambah Bahan / Barang Baru</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Barang / Bahan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pewangi Ocean Fresh 5L"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Barang
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PWG-03"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jerigen 5L / Pack"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batas Minimum
                  </label>
                  <input
                    type="number"
                    value={prodMinStock}
                    onChange={(e) => setProdMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga Beli / Kulak (Rp)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={prodBuyPrice}
                  onChange={(e) => setProdBuyPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
