import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  formatRupiahShort,
  getStatusBadgeInfo,
  formatDateIndo,
} from '../../utils/formatters';
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  DollarSign,
  ArrowRight,
  Package,
  Calendar,
  Printer,
  Smartphone,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NavigationMenu } from '../layout/Sidebar';
import { LaundryStatus } from '../../types';

interface DashboardProps {
  onNavigate: (menu: NavigationMenu) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    stats,
    transactions,
    updateTransactionStatus,
    setReceiptModalTrx,
    setWhatsappModalData,
    setQuickPayModalTrx,
    products,
    currentUser,
  } = useApp();

  const [chartView, setChartView] = useState<'harian' | 'bulanan'>('harian');

  const lowStockItems = products.filter((p) => p.currentStock <= p.minStock);

  // Mock interactive revenue chart data (harian 7 hari terakhir & bulanan 6 bulan terakhir)
  const dailyData = [
    { label: 'Sen', date: '29 Sep', revenue: 420000, orders: 8 },
    { label: 'Sel', date: '30 Sep', revenue: 580000, orders: 12 },
    { label: 'Rab', date: '01 Okt', revenue: 640000, orders: 15 },
    { label: 'Kam', date: '02 Okt', revenue: 510000, orders: 11 },
    { label: 'Jum', date: '03 Okt', revenue: 730000, orders: 16 },
    { label: 'Sab', date: '04 Okt', revenue: 950000, orders: 22 },
    { label: 'Hari Ini', date: '05 Okt', revenue: stats.todayOmzet || 885000, orders: stats.todayTransactionsCount || 19 },
  ];

  const monthlyData = [
    { label: 'Mei', revenue: 16500000, orders: 340 },
    { label: 'Jun', revenue: 18200000, orders: 390 },
    { label: 'Jul', revenue: 19800000, orders: 420 },
    { label: 'Agu', revenue: 21400000, orders: 460 },
    { label: 'Sep', revenue: 23100000, orders: 495 },
    { label: 'Okt (Berjalan)', revenue: 25000000, orders: 510 },
  ];

  const activeChartDataset = chartView === 'harian' ? dailyData : monthlyData;
  const maxRevenue = Math.max(...activeChartDataset.map((d) => d.revenue));

  // Next status progression helper
  const getNextStatus = (current: LaundryStatus): LaundryStatus | null => {
    switch (current) {
      case 'diterima':
        return 'dicuci';
      case 'dicuci':
        return 'dikeringkan';
      case 'dikeringkan':
        return 'disetrika';
      case 'disetrika':
        return 'siap_diambil';
      case 'siap_diambil':
        return 'selesai';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (status: LaundryStatus) => {
    switch (status) {
      case 'diterima':
        return 'Cuci';
      case 'dicuci':
        return 'Keringkan';
      case 'dikeringkan':
        return 'Setrika';
      case 'disetrika':
        return 'Siap Ambil';
      case 'siap_diambil':
        return 'Selesai';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-2xl p-5 lg:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Laundry POS Management System
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
              Selamat Bertugas, {currentUser.name}! 👋
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 mt-1">
              Hari ini ada <b>{stats.pendingOrdersCount} cucian</b> dalam proses pengerjaan dan{' '}
              <b>{stats.readyOrdersCount} pesanan</b> siap diambil pelanggan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('pos')}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Transaksi Baru (POS)
            </button>
            <button
              onClick={() => onNavigate('order_board')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-1.5"
            >
              Papan Cucian
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Omzet Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-cyan-400 transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Omzet Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              {formatRupiah(stats.todayOmzet)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              Kas Masuk Riil
            </div>
          </div>
        </div>

        {/* 2. Jumlah Transaksi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">
              {stats.todayTransactionsCount}{' '}
              <span className="text-xs font-normal text-slate-500">Nota</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Hari Ini</div>
          </div>
        </div>

        {/* 3. Pesanan Belum Selesai */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Belum Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-700">
              {stats.pendingOrdersCount}{' '}
              <span className="text-xs font-normal text-slate-500">Pesanan</span>
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Sedang Dikerjakan</div>
          </div>
        </div>

        {/* 4. Pesanan Siap Diambil */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Siap Diambil</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-700">
              {stats.readyOrdersCount}{' '}
              <span className="text-xs font-normal text-slate-500">Paket</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Di Rak Antrean</div>
          </div>
        </div>

        {/* 5. Piutang Pelanggan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Piutang</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-600">
              {formatRupiah(stats.totalReceivables)}
            </div>
            <div className="text-[11px] text-rose-600 font-medium mt-1">Belum Lunas / DP</div>
          </div>
        </div>

        {/* 6. Pengeluaran Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pengeluaran</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              {formatRupiah(stats.todayExpenses)}
            </div>
            <div className="text-[11px] text-purple-600 font-medium mt-1">Biaya Operasional</div>
          </div>
        </div>

        {/* 7. Laba/Rugi Bersih */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-cyan-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Laba / Rugi</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-lg font-bold ${
                stats.todayProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatRupiah(stats.todayProfit)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Laba Bersih Hari Ini</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Interactive Chart & Order Status Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Grafik Omzet & Pendapatan
              </h3>
              <p className="text-xs text-slate-500">
                Statistik penerimaan kas laundry berdasarkan periode
              </p>
            </div>

            {/* Toggle View */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
              <button
                onClick={() => setChartView('harian')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  chartView === 'harian'
                    ? 'bg-white text-cyan-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                onClick={() => setChartView('bulanan')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  chartView === 'bulanan'
                    ? 'bg-white text-cyan-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 Bulan Terakhir
              </button>
            </div>
          </div>

          {/* Interactive Visual Bar Chart */}
          <div className="pt-4 pb-2">
            <div className="h-56 flex items-end gap-3 sm:gap-6 border-b border-slate-100 px-2">
              {activeChartDataset.map((item, idx) => {
                const heightPercentage = Math.max(15, Math.round((item.revenue / maxRevenue) * 100));
                const isTodayOrLatest = idx === activeChartDataset.length - 1;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md mb-1.5 pointer-events-none whitespace-nowrap shadow-lg">
                      <div className="font-bold">{formatRupiah(item.revenue)}</div>
                      <div className="text-slate-400 text-[10px]">{item.orders} pesanan</div>
                    </div>

                    {/* Bar visual */}
                    <div
                      style={{ height: `${heightPercentage}%` }}
                      className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 group-hover:brightness-110 relative ${
                        isTodayOrLatest
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                    >
                      {isTodayOrLatest && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded-full border border-cyan-200">
                          Aktif
                        </div>
                      )}
                    </div>

                    {/* Bar Label */}
                    <div className="mt-2 text-center">
                      <span className="text-xs font-semibold text-slate-700 block truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {formatRupiahShort(item.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Status Funnel / Pipeline Snapshot */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Papan Status Cucian</h3>
              <button
                onClick={() => onNavigate('order_board')}
                className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
              >
                Papan Kanban <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Antrean operasional di ruang cuci & setrika
            </p>

            <div className="space-y-2.5 mt-4">
              {[
                { status: 'diterima', label: '1. Diterima', count: stats.statusFunnel.diterima, color: 'bg-amber-500' },
                { status: 'dicuci', label: '2. Dicuci', count: stats.statusFunnel.dicuci, color: 'bg-blue-500' },
                { status: 'dikeringkan', label: '3. Dikeringkan', count: stats.statusFunnel.dikeringkan, color: 'bg-cyan-500' },
                { status: 'disetrika', label: '4. Disetrika', count: stats.statusFunnel.disetrika, color: 'bg-purple-500' },
                { status: 'siap_diambil', label: '5. Siap Diambil', count: stats.statusFunnel.siap_diambil, color: 'bg-emerald-500' },
                { status: 'selesai', label: '6. Selesai', count: stats.statusFunnel.selesai, color: 'bg-slate-400' },
              ].map((step) => (
                <div
                  key={step.status}
                  onClick={() => onNavigate('order_board')}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
                    <span className="text-xs font-medium text-slate-700">{step.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {step.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert box if any */}
          {lowStockItems.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900">
                  Perhatian: {lowStockItems.length} Bahan Menipis!
                </span>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {lowStockItems.map((p) => p.name).join(', ')}
                </p>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="font-bold text-amber-900 hover:underline mt-1 block"
                >
                  Lihat Stok & Restock &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table with Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Transaksi & Pesanan Terkini</h3>
            <p className="text-xs text-slate-500">
              Daftar nota transaksi masuk dan progres laundry real-time
            </p>
          </div>
          <button
            onClick={() => onNavigate('order_board')}
            className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 self-start sm:self-auto"
          >
            Lihat Semua Pesanan &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">No. Nota</th>
                <th className="px-5 py-3.5 font-semibold">Pelanggan</th>
                <th className="px-5 py-3.5 font-semibold">Layanan & Berat</th>
                <th className="px-5 py-3.5 font-semibold">Total & Sisa</th>
                <th className="px-5 py-3.5 font-semibold">Status Bayar</th>
                <th className="px-5 py-3.5 font-semibold">Progres Laundry</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map((trx) => {
                const badge = getStatusBadgeInfo(trx.status);
                const nextStatus = getNextStatus(trx.status);

                return (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-900">
                      <div>{trx.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-500">{trx.date}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{trx.customerName}</div>
                      <div className="text-[11px] text-slate-500">{trx.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">
                        {trx.items.map((i) => i.serviceName).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Total {trx.items.reduce((acc, c) => acc + c.quantity, 0)}{' '}
                        {trx.items[0]?.unit || 'kg'} • Rak: {trx.rackLocation || 'Front'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{formatRupiah(trx.grandTotal)}</div>
                      {trx.remainingAmount > 0 ? (
                        <div className="text-[11px] text-rose-600 font-semibold">
                          Sisa: {formatRupiah(trx.remainingAmount)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-600 font-medium">Lunas</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          trx.paymentStatus === 'lunas'
                            ? 'bg-emerald-100 text-emerald-800'
                            : trx.paymentStatus === 'dp'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {trx.paymentStatus === 'dp' ? 'Uang Muka (DP)' : trx.paymentStatus}
                      </span>
                      {trx.remainingAmount > 0 && (
                        <button
                          onClick={() => setQuickPayModalTrx(trx)}
                          className="block text-[10px] text-cyan-600 hover:underline font-semibold mt-1"
                        >
                          + Lunaskan
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Advance status button */}
                        {nextStatus && (
                          <button
                            onClick={() => updateTransactionStatus(trx.id, nextStatus)}
                            title={`Lanjut ke status ${getNextStatusLabel(trx.status)}`}
                            className="px-2.5 py-1 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition-colors flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-cyan-600" />
                            {getNextStatusLabel(trx.status)}
                          </button>
                        )}

                        {/* Struk thermal button */}
                        <button
                          onClick={() => setReceiptModalTrx(trx)}
                          title="Cetak Struk"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp button */}
                        <button
                          onClick={() => setWhatsappModalData({ trx, type: 'diterima' })}
                          title="Kirim Notifikasi WA"
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
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
    </div>
  );
};
