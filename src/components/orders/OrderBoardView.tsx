import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LaundryStatus, Transaction } from '../../types';
import { formatRupiah, getStatusBadgeInfo, formatDateIndo } from '../../utils/formatters';
import {
  KanbanSquare,
  List,
  Search,
  Filter,
  Clock,
  Printer,
  Smartphone,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Package,
} from 'lucide-react';

export const OrderBoardView: React.FC = () => {
  const {
    transactions,
    updateTransactionStatus,
    setReceiptModalTrx,
    setWhatsappModalData,
    setQuickPayModalTrx,
    stats,
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unpaid' | 'express'>('all');

  const columns: {
    status: LaundryStatus;
    title: string;
    count: number;
    color: string;
    headerBg: string;
    border: string;
  }[] = [
    {
      status: 'diterima',
      title: 'Diterima',
      count: stats.statusFunnel.diterima,
      color: 'text-amber-700',
      headerBg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      status: 'dicuci',
      title: 'Dicuci',
      count: stats.statusFunnel.dicuci,
      color: 'text-blue-700',
      headerBg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      status: 'dikeringkan',
      title: 'Dikeringkan',
      count: stats.statusFunnel.dikeringkan,
      color: 'text-cyan-700',
      headerBg: 'bg-cyan-50',
      border: 'border-cyan-200',
    },
    {
      status: 'disetrika',
      title: 'Disetrika',
      count: stats.statusFunnel.disetrika,
      color: 'text-purple-700',
      headerBg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      status: 'siap_diambil',
      title: 'Siap Diambil',
      count: stats.statusFunnel.siap_diambil,
      color: 'text-emerald-700',
      headerBg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      status: 'selesai',
      title: 'Selesai (Diambil)',
      count: stats.statusFunnel.selesai,
      color: 'text-slate-700',
      headerBg: 'bg-slate-100',
      border: 'border-slate-200',
    },
  ];

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerPhone.includes(searchTerm) ||
      (t.rackLocation && t.rackLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'unpaid') {
      return t.remainingAmount > 0;
    }
    if (selectedFilter === 'express') {
      return (
        t.items.some((i) => i.serviceName.toLowerCase().includes('express') || i.serviceName.toLowerCase().includes('kilat')) ||
        (t.additionalFeeNote && t.additionalFeeNote.toLowerCase().includes('express'))
      );
    }
    return true;
  });

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
        return 'Mulai Cuci';
      case 'dicuci':
        return 'Mulai Keringkan';
      case 'dikeringkan':
        return 'Mulai Setrika';
      case 'disetrika':
        return 'Siap Diambil';
      case 'siap_diambil':
        return 'Serahkan ke Pelanggan';
      default:
        return '';
    }
  };

  const handleAdvanceStatus = (trx: Transaction) => {
    const next = getNextStatus(trx.status);
    if (!next) return;

    updateTransactionStatus(trx.id, next);

    // If moving to 'siap_diambil', open WhatsApp modal to notify customer!
    if (next === 'siap_diambil') {
      setWhatsappModalData({ trx, type: 'selesai' });
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no. nota, nama pelanggan, no. telepon, atau rak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedFilter === 'unpaid'
                  ? 'bg-rose-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Lunas
            </button>
            <button
              onClick={() => setSelectedFilter('express')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedFilter === 'express'
                  ? 'bg-amber-500 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Express / Kilat
            </button>
          </div>

          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Papan Kanban"
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel Lengkap"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD (6 COLUMNS) */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {columns.map((col) => {
            const colOrders = filteredTransactions.filter((t) => t.status === col.status);

            return (
              <div
                key={col.status}
                className={`bg-slate-100/80 rounded-2xl border ${col.border} p-3 flex flex-col min-h-[500px] shadow-xs`}
              >
                {/* Column Header */}
                <div
                  className={`${col.headerBg} p-2.5 rounded-xl border ${col.border} flex items-center justify-between mb-3`}
                >
                  <span className={`text-xs font-bold ${col.color}`}>{col.title}</span>
                  <span className="text-xs font-extrabold bg-white px-2 py-0.5 rounded-full shadow-xs text-slate-800">
                    {colOrders.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                  {colOrders.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 italic">
                      Tidak ada pesanan
                    </div>
                  ) : (
                    colOrders.map((trx) => {
                      const nextStatus = getNextStatus(trx.status);
                      const isExpress =
                        trx.items.some((i) => i.serviceName.toLowerCase().includes('express')) ||
                        Boolean(trx.additionalFeeNote?.toLowerCase().includes('express'));

                      return (
                        <div
                          key={trx.id}
                          className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-2.5"
                        >
                          {/* Top: Invoice & Express badge */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[11px] text-slate-900">
                              {trx.invoiceNumber}
                            </span>
                            {isExpress && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md animate-pulse">
                                EXPRESS
                              </span>
                            )}
                          </div>

                          {/* Customer & Items */}
                          <div>
                            <div className="font-bold text-xs text-slate-900 leading-tight">
                              {trx.customerName}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {trx.items.map((i) => `${i.serviceName} (${i.quantity}${i.unit})`).join(', ')}
                            </div>
                          </div>

                          {/* Estimation & Rack */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {trx.estimatedCompletionDate.split(' ')[0]}
                            </span>
                            <span className="font-semibold text-slate-700">
                              {trx.rackLocation || 'Front'}
                            </span>
                          </div>

                          {/* Payment status */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                            <div>
                              <div className="font-extrabold text-slate-900">
                                {formatRupiah(trx.grandTotal)}
                              </div>
                              {trx.remainingAmount > 0 ? (
                                <div className="text-[10px] text-rose-600 font-semibold">
                                  Kurang: {formatRupiah(trx.remainingAmount)}
                                </div>
                              ) : (
                                <div className="text-[10px] text-emerald-600 font-medium">Lunas</div>
                              )}
                            </div>

                            {/* Struk & WhatsApp quick icons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setReceiptModalTrx(trx)}
                                title="Cetak Struk"
                                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setWhatsappModalData({
                                    trx,
                                    type:
                                      trx.status === 'siap_diambil'
                                        ? 'selesai'
                                        : trx.status === 'selesai'
                                        ? 'diterima'
                                        : 'diproses',
                                  })
                                }
                                title="Kirim WA"
                                className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Advance Status Button */}
                          {nextStatus && (
                            <button
                              onClick={() => handleAdvanceStatus(trx)}
                              className="w-full py-1.5 px-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>{getNextStatusLabel(trx.status)}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">No. Nota & Tgl</th>
                  <th className="px-5 py-3.5 font-semibold">Pelanggan</th>
                  <th className="px-5 py-3.5 font-semibold">Item Layanan</th>
                  <th className="px-5 py-3.5 font-semibold">Estimasi Selesai</th>
                  <th className="px-5 py-3.5 font-semibold">Total & Sisa</th>
                  <th className="px-5 py-3.5 font-semibold">Status Pengerjaan</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((trx) => {
                  const badge = getStatusBadgeInfo(trx.status);
                  const nextStatus = getNextStatus(trx.status);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono">
                        <div className="font-bold text-slate-900">{trx.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-500">{trx.date}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{trx.customerName}</div>
                        <div className="text-[11px] text-slate-500">{trx.customerPhone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">
                          {trx.items.map((i) => `${i.serviceName} (${i.quantity} ${i.unit})`).join('; ')}
                        </div>
                        <div className="text-[10px] text-slate-500">Rak: {trx.rackLocation}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {trx.estimatedCompletionDate}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">
                          {formatRupiah(trx.grandTotal)}
                        </div>
                        {trx.remainingAmount > 0 ? (
                          <div className="text-[10px] text-rose-600 font-semibold">
                            Sisa: {formatRupiah(trx.remainingAmount)}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600">Lunas</div>
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
                          {nextStatus && (
                            <button
                              onClick={() => handleAdvanceStatus(trx)}
                              className="px-2.5 py-1 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200"
                            >
                              {getNextStatusLabel(trx.status)}
                            </button>
                          )}
                          <button
                            onClick={() => setReceiptModalTrx(trx)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
                            title="Cetak Struk"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setWhatsappModalData({
                                trx,
                                type: trx.status === 'siap_diambil' ? 'selesai' : 'diproses',
                              })
                            }
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg border border-emerald-200"
                            title="Kirim WA"
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
      )}
    </div>
  );
};
