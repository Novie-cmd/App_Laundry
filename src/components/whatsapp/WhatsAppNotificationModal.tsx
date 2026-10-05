import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateWhatsAppMessage, openWhatsApp } from '../../utils/formatters';
import { Smartphone, Send, Copy, Check, X, Bell } from 'lucide-react';

export const WhatsAppNotificationModal: React.FC = () => {
  const { whatsappModalData, setWhatsappModalData, settings } = useApp();
  const [selectedType, setSelectedType] = useState<
    'diterima' | 'diproses' | 'selesai' | 'belum_diambil' | 'tagihan_piutang'
  >(whatsappModalData?.type || 'diterima');
  const [copied, setCopied] = useState(false);

  if (!whatsappModalData) return null;

  const trx = whatsappModalData.trx;
  const currentMessage = generateWhatsAppMessage(selectedType, trx, settings);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = () => {
    openWhatsApp(trx.customerPhone, currentMessage);
  };

  const notificationTabs = [
    { id: 'diterima', label: '1. Diterima', desc: 'Nota & konfirmasi pesanan' },
    { id: 'diproses', label: '2. Diproses', desc: 'Pemberitahuan cucian dikerjakan' },
    { id: 'selesai', label: '3. Siap Diambil', desc: 'Kabar cucian selesai wangi' },
    { id: 'belum_diambil', label: '4. Belum Diambil', desc: 'Pengingat ambil pakaian' },
    { id: 'tagihan_piutang', label: '5. Tagihan Piutang', desc: 'Pengingat sisa pelunasan' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-600 text-white">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-semibold text-lg">Kirim Notifikasi WhatsApp</h3>
              <p className="text-xs text-emerald-100">
                Penerima: {trx.customerName} ({trx.customerPhone})
              </p>
            </div>
          </div>
          <button
            onClick={() => setWhatsappModalData(null)}
            className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Scenarios */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
            Pilih Format Pesan WhatsApp:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {notificationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                  selectedType === tab.id
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">
                  {tab.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
              Preview Teks Pesan WhatsApp
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Target No: {trx.customerPhone || 'Nomor HP belum diisi'}
            </span>
          </div>

          <div className="bg-slate-900 text-emerald-300 font-mono-receipt text-xs p-4 rounded-xl max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
            {currentMessage}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Pesan Tersalin!' : 'Salin Teks Pesan'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWhatsappModalData(null)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSendWA}
              disabled={!trx.customerPhone}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              Buka WhatsApp (wa.me)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
