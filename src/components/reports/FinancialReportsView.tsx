import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, exportToCSV } from '../../utils/formatters';
import {
  Receipt,
  Download,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Layers,
  CreditCard,
  Printer,
} from 'lucide-react';

export const FinancialReportsView: React.FC = () => {
  const { transactions, expenses, exportSheetAsCSV } = useApp();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'profit_loss' | 'receivables'>('profit_loss');

  // Filter dates
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate start date based on period
  const getFilterStartDate = () => {
    const now = new Date();
    if (period === 'today') return todayStr;
    if (period === 'week') {
      const prev = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return prev.toISOString().split('T')[0];
    }
    if (period === 'month') {
      const prev = new Date(now.getFullYear(), now.getMonth(), 1);
      return prev.toISOString().split('T')[0];
    }
    return '2026-01-01';
  };

  const startDate = getFilterStartDate();

  // Filtered transactions and expenses based on period
  const periodTransactions = transactions.filter((t) => t.date.split(' ')[0] >= startDate);
  const periodExpenses = expenses.filter((e) => e.date.split(' ')[0] >= startDate);

  // Income Breakdown
  const totalRevenue = periodTransactions.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalPaidRevenue = periodTransactions.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalRemainingDebt = periodTransactions.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const totalExpenses = periodExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalPaidRevenue - totalExpenses;

  // Revenue by Payment Method
  const paymentMethodSummary = {
    tunai: periodTransactions.filter((t) => t.paymentMethod === 'tunai').reduce((a, c) => a + c.paidAmount, 0),
    qris: periodTransactions.filter((t) => t.paymentMethod === 'qris').reduce((a, c) => a + c.paidAmount, 0),
    transfer: periodTransactions.filter((t) => t.paymentMethod === 'transfer').reduce((a, c) => a + c.paidAmount, 0),
    ewallet: periodTransactions.filter((t) => t.paymentMethod === 'ewallet').reduce((a, c) => a + c.paidAmount, 0),
  };

  // Revenue by Service Category
  const serviceCategoryMap: Record<string, number> = {};
  periodTransactions.forEach((trx) => {
    trx.items.forEach((item) => {
      serviceCategoryMap[item.serviceName] =
        (serviceCategoryMap[item.serviceName] || 0) + item.subtotal;
    });
  });

  // Expense by Category
  const expenseCategoryMap: Record<string, number> = {};
  periodExpenses.forEach((exp) => {
    expenseCategoryMap[exp.category] = (expenseCategoryMap[exp.category] || 0) + exp.amount;
  });

  const handleExportFullReport = () => {
    const rows = [
      ['LAPORAN KEUANGAN & LABA RUGI LAUNDRY'],
      ['Periode', period.toUpperCase()],
      ['Tanggal Cetak', new Date().toLocaleString('id-ID')],
      [''],
      ['RINGKASAN LABA / RUGI'],
      ['Total Omzet Transaksi', totalRevenue],
      ['Total Pemasukan Kas Diterima', totalPaidRevenue],
      ['Total Piutang Belum Lunas', totalRemainingDebt],
      ['Total Pengeluaran Biaya', totalExpenses],
      ['LABA BERSIH (Pemasukan - Pengeluaran)', netProfit],
      [''],
      ['RINCIAN PENGELUARAN PER KATEGORI'],
      ...Object.entries(expenseCategoryMap).map(([cat, amt]) => [cat, amt]),
    ];
    exportToCSV(`laporan_keuangan_${period}`, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Period Selector & Export */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              period === 'today'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              period === 'week'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              period === 'month'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              period === 'custom'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Data
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Laporan
          </button>
          <button
            onClick={handleExportFullReport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor ke Excel / CSV
          </button>
        </div>
      </div>

      {/* Financial Snapshot Summary (Laba Rugi Format) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
          <div>
            <h3 className="font-extrabold text-lg text-white">
              LAPORAN LABA / RUGI BERSIH
            </h3>
            <p className="text-xs text-slate-400">
              Periode:{' '}
              {period === 'today'
                ? 'Hari Ini'
                : period === 'week'
                ? 'Minggu Ini'
                : period === 'month'
                ? 'Bulan Ini'
                : 'Seluruh Waktu'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Hasil Operasional:</span>
            <div
              className={`text-2xl font-black ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatRupiah(netProfit)}
            </div>
          </div>
        </div>

        {/* Visual Ledger Structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-receipt">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
            <div className="text-slate-400 font-sans font-semibold text-xs">PEMASUKAN (INCOME)</div>
            <div className="flex justify-between">
              <span>Omzet Pesanan:</span>
              <span className="font-bold text-white">{formatRupiah(totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-700 pt-1">
              <span>Kas Terbayar Masuk:</span>
              <span>{formatRupiah(totalPaidRevenue)}</span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>Belum Lunas (Piutang):</span>
              <span>{formatRupiah(totalRemainingDebt)}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
            <div className="text-slate-400 font-sans font-semibold text-xs">PENGELUARAN (EXPENSES)</div>
            <div className="flex justify-between">
              <span>Jumlah Item Biaya:</span>
              <span className="text-white">{periodExpenses.length} Transaksi</span>
            </div>
            <div className="flex justify-between text-rose-400 font-bold border-t border-slate-700 pt-1">
              <span>Total Beban Operasional:</span>
              <span>{formatRupiah(totalExpenses)}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-1">
              Bahan, listrik, air, perawatan & operasional
            </div>
          </div>

          <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-800/80 space-y-2">
            <div className="text-emerald-300 font-sans font-semibold text-xs">LABA BERSIH (NET PROFIT)</div>
            <div className="flex justify-between">
              <span>Pemasukan:</span>
              <span className="text-emerald-200">{formatRupiah(totalPaidRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pengeluaran:</span>
              <span className="text-rose-300">-{formatRupiah(totalExpenses)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-400 text-sm border-t border-emerald-800 pt-1">
              <span>Laba Bersih:</span>
              <span>{formatRupiah(netProfit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Details: Revenue By Payment Method & Revenue By Service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Method Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Pemasukan Berdasarkan Metode Bayar
            </h3>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Tunai (Cash)', amount: paymentMethodSummary.tunai, color: 'bg-emerald-500' },
              { label: 'QRIS', amount: paymentMethodSummary.qris, color: 'bg-cyan-500' },
              { label: 'Transfer Bank (BCA/Mandiri)', amount: paymentMethodSummary.transfer, color: 'bg-blue-500' },
              { label: 'E-Wallet (GoPay/OVO/DANA)', amount: paymentMethodSummary.ewallet, color: 'bg-purple-500' },
            ].map((m, idx) => {
              const pct = totalPaidRevenue > 0 ? Math.round((m.amount / totalPaidRevenue) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{m.label}</span>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(m.amount)}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${m.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses by Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm text-slate-900">Pengeluaran Berdasarkan Kategori</h3>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {Object.keys(expenseCategoryMap).length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center italic">
                Belum ada pengeluaran yang tercatat pada periode ini.
              </div>
            ) : (
              Object.entries(expenseCategoryMap).map(([cat, amt]) => {
                const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="font-bold text-rose-600">
                        {formatRupiah(amt)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-rose-500" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
