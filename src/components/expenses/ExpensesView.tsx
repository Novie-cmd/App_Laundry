import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, PaymentMethod } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  Filter,
  Download,
  CreditCard,
  Banknote,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, currentUser, exportSheetAsCSV } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Form states
  const [category, setCategory] = useState<ExpenseCategory>('Detergen');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');

  const categories: ExpenseCategory[] = [
    'Detergen',
    'Plastik',
    'Pewangi',
    'Listrik',
    'Air',
    'Gaji',
    'Sewa',
    'Transportasi',
    'Perawatan Mesin',
    'Lainnya',
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    addExpense({
      date: dateStr,
      category,
      amount,
      description,
      paymentMethod,
      recordedBy: currentUser.name,
    });

    setShowAddModal(false);
    setAmount(0);
    setDescription('');
  };

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategoryFilter === 'all') return true;
    return e.category === selectedCategoryFilter;
  });

  const totalFilteredAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Pengeluaran (Tercatat)</div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">
              {formatRupiah(totalFilteredAmount)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {filteredExpenses.length} transaksi pengeluaran
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Bahan & Kemasan</div>
            <div className="text-xl font-extrabold text-slate-800 mt-1">
              {formatRupiah(
                expenses
                  .filter((e) => ['Detergen', 'Plastik', 'Pewangi'].includes(e.category))
                  .reduce((a, c) => a + c.amount, 0)
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Detergen, pewangi, plastik</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Utilitas & Mesin</div>
            <div className="text-xl font-extrabold text-slate-800 mt-1">
              {formatRupiah(
                expenses
                  .filter((e) => ['Listrik', 'Air', 'Perawatan Mesin'].includes(e.category))
                  .reduce((a, c) => a + c.amount, 0)
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Listrik, air, servis mesin</div>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedCategoryFilter === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSheetAsCSV('expenses')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Catat Pengeluaran
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Tgl & Jam</th>
                <th className="px-5 py-3.5 font-semibold">Kategori</th>
                <th className="px-5 py-3.5 font-semibold">Keterangan Pengeluaran</th>
                <th className="px-5 py-3.5 font-semibold">Metode Bayar</th>
                <th className="px-5 py-3.5 font-semibold">Nominal (Rp)</th>
                <th className="px-5 py-3.5 font-semibold">Dicatat Oleh</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 text-slate-600">{exp.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{exp.description}</td>
                  <td className="px-5 py-3.5 uppercase text-slate-600 font-medium">
                    {exp.paymentMethod}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-rose-600 text-sm">
                    {formatRupiah(exp.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{exp.recordedBy}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Catat Pengeluaran Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">Catat Pengeluaran Operasional</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Pengeluaran *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah Pengeluaran (Rp) *
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  placeholder="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Rincian Belanja *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli 2 jerigen detergen konsentrat 5L"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tunai')}
                    className={`py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'tunai'
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-800'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    Tunai (Potong Kas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`py-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'transfer'
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-800'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Transfer Bank
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
