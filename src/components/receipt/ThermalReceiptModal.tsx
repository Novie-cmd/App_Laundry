import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, generateWhatsAppMessage, openWhatsApp } from '../../utils/formatters';
import { Printer, Share2, Copy, Check, X, Smartphone } from 'lucide-react';

export const ThermalReceiptModal: React.FC = () => {
  const { receiptModalTrx, setReceiptModalTrx, settings } = useApp();
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(settings.thermalWidth || '58mm');
  const [copied, setCopied] = useState(false);

  if (!receiptModalTrx) return null;

  const trx = receiptModalTrx;
  const changeAmount = Math.max(0, trx.paidAmount - trx.grandTotal);
  const remainingDebt = Math.max(0, trx.grandTotal - trx.paidAmount);

  const handlePrint = () => {
    window.print();
  };

  const getReceiptPlainText = () => {
    const divider = '--------------------------------';
    const doubleDivider = '================================';

    const itemLines = trx.items
      .map((item) => {
        return `${item.serviceName}\n${item.quantity} ${item.unit} x ${formatRupiah(item.price).padEnd(12)} ${formatRupiah(item.subtotal)}`;
      })
      .join('\n\n');

    return `${doubleDivider}
          ${settings.storeName.toUpperCase()}
       ${settings.address}
          Telp: ${settings.phone}
${doubleDivider}
No  : ${trx.invoiceNumber}
Tgl : ${trx.date}
Kasir: ${trx.cashierName}
Rak : ${trx.rackLocation || 'Front Desk'}

Pelanggan : ${trx.customerName} (${trx.customerPhone || '-'})
${divider}
${itemLines}
${divider}
Subtotal                 ${formatRupiah(trx.subtotal)}
${trx.discount > 0 ? `Diskon                   -${formatRupiah(trx.discount)}\n` : ''}${trx.additionalFee > 0 ? `Biaya Tambahan           +${formatRupiah(trx.additionalFee)}\n` : ''}TOTAL                    ${formatRupiah(trx.grandTotal)}

Bayar (${trx.paymentMethod.toUpperCase()})            ${formatRupiah(trx.paidAmount)}
${changeAmount > 0 ? `Kembali                  ${formatRupiah(changeAmount)}\n` : ''}${remainingDebt > 0 ? `Sisa Belum Bayar         ${formatRupiah(remainingDebt)}\n` : ''}Status Pembayaran        ${trx.paymentStatus.toUpperCase()}
${divider}
Estimasi Selesai:
${trx.estimatedCompletionDate}

${settings.footerNote || 'Terima kasih atas kunjungan Anda!\nSimpan struk ini sebagai bukti pengambilan.'}
${doubleDivider}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getReceiptPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = () => {
    const message = generateWhatsAppMessage('diterima', trx, settings);
    openWhatsApp(trx.customerPhone, message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-lg">Struk Thermal Kasir</h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Width Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  paperWidth === '58mm' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                58mm
              </button>
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  paperWidth === '80mm' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm
              </button>
            </div>
            <button
              onClick={() => setReceiptModalTrx(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - Receipt Visual */}
        <div className="p-6 bg-slate-100 flex flex-col items-center max-h-[70vh] overflow-y-auto">
          {/* Printable & Visible Receipt Card */}
          <div
            id="printable-receipt"
            className={`bg-white text-slate-950 font-mono-receipt p-5 shadow-md border border-slate-300 rounded-sm select-text text-xs leading-relaxed transition-all ${
              paperWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-2">
              <div className="text-sm font-bold tracking-tight uppercase">{settings.storeName}</div>
              <div className="text-[11px] text-slate-700 mt-0.5">{settings.address}</div>
              <div className="text-[11px] text-slate-700">Telp: {settings.phone}</div>
              {settings.headerNote && (
                <div className="text-[10px] text-slate-600 italic mt-0.5">{settings.headerNote}</div>
              )}
            </div>

            <div className="border-t border-b border-dashed border-slate-400 py-1.5 my-2">
              <div className="flex justify-between">
                <span>No :</span>
                <span className="font-semibold">{trx.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tgl:</span>
                <span>{trx.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{trx.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Rak:</span>
                <span className="font-semibold">{trx.rackLocation || 'Front Desk'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 mt-1">
                <span>Pelanggan:</span>
                <span className="font-semibold">{trx.customerName}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 py-1">
              {trx.items.map((item, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-1 last:border-none">
                  <div className="font-medium text-slate-900">{item.serviceName}</div>
                  <div className="flex justify-between text-slate-700">
                    <span>
                      {item.quantity} {item.unit} x {formatRupiah(item.price)}
                    </span>
                    <span className="font-medium text-slate-900">{formatRupiah(item.subtotal)}</span>
                  </div>
                  {item.notes && <div className="text-[10px] text-slate-500 italic">*{item.notes}</div>}
                </div>
              ))}
            </div>

            {/* Subtotal, Discount, Total */}
            <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 mt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(trx.subtotal)}</span>
              </div>
              {trx.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon</span>
                  <span>-{formatRupiah(trx.discount)}</span>
                </div>
              )}
              {trx.additionalFee > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Biaya Tambahan ({trx.additionalFeeNote || 'Ekstra'})</span>
                  <span>+{formatRupiah(trx.additionalFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-1">
                <span>TOTAL</span>
                <span>{formatRupiah(trx.grandTotal)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t border-slate-200 pt-1.5 mt-1.5 space-y-1">
              <div className="flex justify-between">
                <span>Bayar ({trx.paymentMethod.toUpperCase()})</span>
                <span>{formatRupiah(trx.paidAmount)}</span>
              </div>
              {changeAmount > 0 && (
                <div className="flex justify-between">
                  <span>Kembali</span>
                  <span>{formatRupiah(changeAmount)}</span>
                </div>
              )}
              {remainingDebt > 0 && (
                <div className="flex justify-between font-semibold text-rose-600">
                  <span>Sisa Tagihan</span>
                  <span>{formatRupiah(remainingDebt)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-0.5">
                <span>Status</span>
                <span
                  className={
                    trx.paymentStatus === 'lunas'
                      ? 'text-emerald-700 font-bold'
                      : trx.paymentStatus === 'dp'
                      ? 'text-amber-600 font-bold'
                      : 'text-rose-600 font-bold'
                  }
                >
                  {trx.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Estimation & Barcode/QR */}
            <div className="border-t border-dashed border-slate-400 pt-2 mt-2 text-center">
              <div className="text-[11px] font-semibold">Estimasi Selesai:</div>
              <div className="font-bold text-slate-800 text-[11px]">{trx.estimatedCompletionDate}</div>

              {/* Decorative mini barcode simulator */}
              <div className="flex justify-center items-center gap-[2px] h-6 my-2 px-6">
                {[4, 2, 6, 1, 5, 2, 7, 3, 2, 5, 1, 6, 3, 4, 2, 6, 1, 3, 5, 2, 4, 1, 6].map((w, i) => (
                  <div
                    key={i}
                    className="bg-black h-full"
                    style={{ width: `${(w % 3) + 1}px` }}
                  />
                ))}
              </div>
              <div className="text-[9px] text-slate-500 tracking-widest">{trx.invoiceNumber}</div>

              {/* Footer notes */}
              <div className="text-[10px] text-slate-600 mt-2 whitespace-pre-line">
                {settings.footerNote || 'Terima kasih\nSimpan struk ini sebagai bukti.'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : 'Salin Teks'}
            </button>
            <button
              onClick={handleSendWA}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Kirim ke WA
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setReceiptModalTrx(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Struk (Thermal)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
