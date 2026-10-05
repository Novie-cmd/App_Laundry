import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  PlusCircle,
  Printer,
  History,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const CashManagementView: React.FC = () => {
  const {
    cashShift,
    cashTransactions,
    addCashEntry,
    closeCurrentShift,
    startNewShift,
    currentUser,
    settings,
  } = useApp();

  // Modals state
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showAddCashModal, setShowAddCashModal] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);

  // Close shift form
  const [countedCash, setCountedCash] = useState<number>(cashShift.expectedCash);
  const [closeNote, setCloseNote] = useState('');

  // Add cash form
  const [cashType, setCashType] = useState<'masuk' | 'keluar'>('masuk');
  const [cashCategory, setCashCategory] = useState('Modal Tambahan');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashDesc, setCashDesc] = useState('');

  // Open new shift form
  const [newStartingCash, setNewStartingCash] = useState<number>(1000000);

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeCurrentShift(countedCash, closeNote);
    setShowCloseShiftModal(false);
  };

  const handleAddCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cashAmount <= 0) return;

    addCashEntry({
      date: `${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().slice(0, 5)}`,
      type: cashType,
      category: cashCategory,
      amount: cashAmount,
      description: cashDesc,
      cashierName: currentUser.name,
    });

    setShowAddCashModal(false);
    setCashAmount(0);
    setCashDesc('');
  };

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startNewShift(newStartingCash);
    setShowOpenShiftModal(false);
  };

  const printClosingReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Shift Status Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              cashShift.isClosed
                ? 'bg-rose-50 text-rose-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {cashShift.isClosed ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">
                Shift Kasir: {cashShift.cashierName}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  cashShift.isClosed
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {cashShift.isClosed ? 'Shift Ditutup' : 'Shift Aktif'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dibuka: {cashShift.openedAt}{' '}
              {cashShift.closedAt && `• Ditutup: ${cashShift.closedAt}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!cashShift.isClosed ? (
            <>
              <button
                onClick={() => setShowAddCashModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-slate-600" />
                Kas Masuk / Keluar
              </button>
              <button
                onClick={() => setShowCloseShiftModal(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                Tutup Kas Harian
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowOpenShiftModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Unlock className="w-4 h-4" />
              Buka Shift Kas Baru
            </button>
          )}
        </div>
      </div>

      {/* Cash Breakdown Display (Sesuai format di spesifikasi) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4">
            Rekap Saldo Kas Laci Kasir (Cash Drawer)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Saldo Awal</div>
              <div className="text-xl font-bold mt-1 text-white">
                {formatRupiah(cashShift.startingCash)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Modal kas pagi</div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Pemasukan Laundry (Tunai)</div>
              <div className="text-xl font-bold mt-1 text-emerald-400">
                +{formatRupiah(cashShift.laundryIncomeCash)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dari transaksi nota</div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Pengeluaran Tunai</div>
              <div className="text-xl font-bold mt-1 text-rose-400">
                -{formatRupiah(cashShift.expensesCash)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Operasional & belanja</div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs text-cyan-300 font-semibold">SALDO AKHIR SISTEM</div>
              <div className="text-2xl font-extrabold text-cyan-400 mt-1">
                {formatRupiah(cashShift.expectedCash)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Seharusnya ada di laci</div>
            </div>
          </div>

          {/* Actual Cash & Difference if Closed */}
          {cashShift.isClosed && cashShift.actualCash !== undefined && (
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400">Uang Fisik Dihitung: </span>
                  <span className="font-bold text-white text-sm">
                    {formatRupiah(cashShift.actualCash)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Selisih Kas: </span>
                  <span
                    className={`font-bold text-sm ${
                      (cashShift.difference || 0) === 0
                        ? 'text-emerald-400'
                        : (cashShift.difference || 0) > 0
                        ? 'text-cyan-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {formatRupiah(cashShift.difference || 0)}{' '}
                    {(cashShift.difference || 0) === 0
                      ? '(Pas / Sesuai)'
                      : (cashShift.difference || 0) > 0
                      ? '(Selisih Lebih)'
                      : '(Selisih Kurang)'}
                  </span>
                </div>
              </div>
              {cashShift.note && (
                <div className="text-slate-400 italic">Catatan: &ldquo;{cashShift.note}&rdquo;</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cash Mutations History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Mutasi Kas Masuk & Kas Keluar</h3>
            <p className="text-xs text-slate-500">
              Catatan lengkap transaksi uang fisik pada laci kas
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
            {cashTransactions.length} Transaksi Kas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Tgl & Jam</th>
                <th className="px-5 py-3.5 font-semibold">Jenis Kas</th>
                <th className="px-5 py-3.5 font-semibold">Kategori</th>
                <th className="px-5 py-3.5 font-semibold">Keterangan</th>
                <th className="px-5 py-3.5 font-semibold">Nominal</th>
                <th className="px-5 py-3.5 font-semibold">Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashTransactions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 text-slate-600">{c.date}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.type === 'masuk'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {c.type === 'masuk' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      Kas {c.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{c.category}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.description}</td>
                  <td
                    className={`px-5 py-3.5 font-bold ${
                      c.type === 'masuk' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {c.type === 'masuk' ? '+' : '-'}
                    {formatRupiah(c.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{c.cashierName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tutup Kas Harian */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">Tutup Kas Harian & Serah Terima</h3>
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Saldo Awal Shift:</span>
                  <span className="font-medium text-slate-900">
                    {formatRupiah(cashShift.startingCash)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Pemasukan Tunai:</span>
                  <span className="font-medium text-emerald-600">
                    +{formatRupiah(cashShift.laundryIncomeCash)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Pengeluaran Kas:</span>
                  <span className="font-medium text-rose-600">
                    -{formatRupiah(cashShift.expensesCash)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-2 text-cyan-800">
                  <span>Saldo Kas Menurut Sistem:</span>
                  <span>{formatRupiah(cashShift.expectedCash)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hitungan Uang Fisik Riil di Laci (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    value={countedCash}
                    onChange={(e) => setCountedCash(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>Selisih:</span>
                  <span
                    className={`font-bold ${
                      countedCash - cashShift.expectedCash === 0
                        ? 'text-emerald-600'
                        : countedCash - cashShift.expectedCash > 0
                        ? 'text-cyan-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {formatRupiah(countedCash - cashShift.expectedCash)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tutup Kas
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Uang fisik pas, diserahkan ke kasir shift malam"
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseShiftModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Konfirmasi & Tutup Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Kas Masuk / Keluar */}
      {showAddCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">Input Kas Masuk / Keluar Manual</h3>
              <button
                onClick={() => setShowAddCashModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCashSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kas</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashType('masuk')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      cashType === 'masuk'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    Kas Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashType('keluar')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      cashType === 'keluar'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    Kas Keluar (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Tambah Uang Kembalian / Beli Es"
                  value={cashCategory}
                  onChange={(e) => setCashCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal (Rp) *
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  placeholder="0"
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Penjelasan transaksi kas..."
                  value={cashDesc}
                  onChange={(e) => setCashDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCashModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Buka Shift Baru */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">Buka Shift Kas Baru</h3>
              <button
                onClick={() => setShowOpenShiftModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOpenShiftSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modal Kas Awal Kasir (Rp) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  value={newStartingCash}
                  onChange={(e) => setNewStartingCash(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Uang pecahan kembalian yang dimasukkan ke laci kasir saat awal bertugas.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenShiftModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Buka Shift Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
