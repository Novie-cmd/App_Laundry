import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, generateWhatsAppMessage, openWhatsApp } from '../../utils/formatters';
import {
  CreditCard,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Printer,
  History,
  Banknote,
} from 'lucide-react';

export const PaymentReceivablesView: React.FC = () => {
  const { transactions, setQuickPayModalTrx, setReceiptModalTrx, settings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'receivables' | 'history'>('receivables');

  // Filter transactions with remaining debt (Piutang)
  const receivables = transactions.filter((t) => t.remainingAmount > 0);

  // All payment history records
  const allPaymentRecords = transactions
    .flatMap((t) => t.payments || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPiutang = receivables.reduce((acc, curr) => acc + curr.remainingAmount, 0);

  const filteredReceivables = receivables.filter(
    (t) =>
      t.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerPhone.includes(searchTerm)
  );

  const handleSendBillWA = (trx: any) => {
    const text = generateWhatsAppMessage('tagihan_piutang', trx, settings);
    openWhatsApp(trx.customerPhone, text);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Piutang Belum Lunas</div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">
              {formatRupiah(totalPiutang)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Dari {receivables.length} nota transaksi belum lunas
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Transaksi Lunas</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {transactions.filter((t) => t.paymentStatus === 'lunas').length} Nota
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
              Selesai terbayar penuh
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Riwayat Pembayaran Masuk</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">
              {allPaymentRecords.length} Kali
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tercatat di kas masuk</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('receivables')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'receivables'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Piutang & DP ({receivables.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Pembayaran ({allPaymentRecords.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pelanggan, nota, no HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* TAB 1: DAFTAR PIUTANG */}
      {activeTab === 'receivables' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">No. Transaksi & Tgl</th>
                  <th className="px-5 py-3.5 font-semibold">Pelanggan</th>
                  <th className="px-5 py-3.5 font-semibold">Total Tagihan</th>
                  <th className="px-5 py-3.5 font-semibold">Sudah Dibayar (DP)</th>
                  <th className="px-5 py-3.5 font-semibold">Sisa Piutang</th>
                  <th className="px-5 py-3.5 font-semibold">Status Pakaian</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Aksi Pelunasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                      Tidak ada piutang yang tertunggak. Semua tagihan telah lunas! 🎉
                    </td>
                  </tr>
                ) : (
                  filteredReceivables.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono">
                        <div className="font-bold text-slate-900">{trx.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-500">{trx.date}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{trx.customerName}</div>
                        <div className="text-[11px] text-slate-500">{trx.customerPhone}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {formatRupiah(trx.grandTotal)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-600">
                        {formatRupiah(trx.paidAmount)}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-rose-600 text-sm">
                        {formatRupiah(trx.remainingAmount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800 uppercase">
                          {trx.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setQuickPayModalTrx(trx)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Bayar / Lunaskan
                          </button>
                          <button
                            onClick={() => handleSendBillWA(trx)}
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                            title="Tagih via WhatsApp"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setReceiptModalTrx(trx)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
                            title="Cetak Struk"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: RIWAYAT PEMBAYARAN */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Tgl & Jam</th>
                  <th className="px-5 py-3.5 font-semibold">No. Nota</th>
                  <th className="px-5 py-3.5 font-semibold">Pelanggan</th>
                  <th className="px-5 py-3.5 font-semibold">Jenis Pembayaran</th>
                  <th className="px-5 py-3.5 font-semibold">Metode</th>
                  <th className="px-5 py-3.5 font-semibold">Nominal Masuk</th>
                  <th className="px-5 py-3.5 font-semibold">Kasir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allPaymentRecords.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-slate-600">{p.date}</td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-900">
                      {p.invoiceNumber}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{p.customerName}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.type === 'penuh'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.type === 'pelunasan'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.type === 'dp' ? 'Uang Muka (DP)' : p.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 uppercase font-medium text-slate-700">
                      {p.paymentMethod}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-700">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{p.cashierName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
