import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { PaymentMethod } from '../../types';
import { DollarSign, CheckCircle, X, CreditCard, Banknote, QrCode, Wallet } from 'lucide-react';

export const QuickPaymentModal: React.FC = () => {
  const { quickPayModalTrx, setQuickPayModalTrx, addPaymentToTransaction, setReceiptModalTrx } = useApp();
  const [payAmount, setPayAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('tunai');
  const [notes, setNotes] = useState('');

  if (!quickPayModalTrx) return null;

  const trx = quickPayModalTrx;
  const remaining = trx.remainingAmount;

  // Initialize payment amount when modal opens
  const effectiveAmount = payAmount > 0 ? payAmount : remaining;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount <= 0) return;

    addPaymentToTransaction(trx.id, effectiveAmount, method, notes);
    setQuickPayModalTrx(null);

    // Prompt to view receipt
    setTimeout(() => {
      setReceiptModalTrx({
        ...trx,
        paidAmount: trx.paidAmount + effectiveAmount,
        remainingAmount: Math.max(0, trx.remainingAmount - effectiveAmount),
        paymentStatus: trx.remainingAmount - effectiveAmount <= 0 ? 'lunas' : 'dp',
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-lg">Pelunasan / Bayar Tagihan</h3>
              <p className="text-xs text-slate-400">{trx.invoiceNumber} • {trx.customerName}</p>
            </div>
          </div>
          <button
            onClick={() => setQuickPayModalTrx(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Total Transaksi:</span>
              <span className="font-medium text-slate-900">{formatRupiah(trx.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Sudah Dibayar (DP):</span>
              <span className="font-medium text-emerald-600">{formatRupiah(trx.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2 text-rose-600">
              <span>Sisa Tagihan:</span>
              <span>{formatRupiah(remaining)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
              Nominal Yang Dibayarkan (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                min="1000"
                max={remaining}
                value={effectiveAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>

            {/* Quick buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPayAmount(remaining)}
                className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs border border-emerald-300 transition-colors"
              >
                Lunaskan ({formatRupiah(remaining)})
              </button>
              {remaining > 50000 && (
                <button
                  type="button"
                  onClick={() => setPayAmount(50000)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-colors"
                >
                  50.000
                </button>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'tunai', label: 'Tunai', icon: Banknote },
                { id: 'qris', label: 'QRIS', icon: QrCode },
                { id: 'transfer', label: 'Transfer Bank', icon: CreditCard },
                { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id as PaymentMethod)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      method === m.id
                        ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-semibold ring-1 ring-cyan-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-600" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Titip pelunasan saat baju diambil"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickPayModalTrx(null)}
              className="flex-1 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
