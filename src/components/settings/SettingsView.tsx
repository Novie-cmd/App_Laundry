import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Printer, Store, CreditCard, RotateCcw, Check, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useApp();

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data ke data demo awal?')) {
      resetDemoData();
      alert('Data telah berhasil direset ke pengaturan & sampel demo awal.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profil Toko & Outlet */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-sm text-slate-900">Profil Outlet & Toko Laundry</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Outlet Laundry *
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Lengkap Outlet *
              </label>
              <textarea
                rows={2}
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp Outlet *
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Printer Thermal & Format Struk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Printer className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Pengaturan Printer Thermal & Struk Kasir
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Ukuran Kertas Printer Thermal Default
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  form.thermalWidth === '58mm'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 ring-1 ring-cyan-500 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="printerWidth"
                  checked={form.thermalWidth === '58mm'}
                  onChange={() => setForm({ ...form, thermalWidth: '58mm' })}
                  className="hidden"
                />
                <div>
                  <div className="text-xs">58 mm (Mini Portable)</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Lebar standar struk Bluetooth mobile
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  form.thermalWidth === '80mm'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-900 ring-1 ring-cyan-500 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="printerWidth"
                  checked={form.thermalWidth === '80mm'}
                  onChange={() => setForm({ ...form, thermalWidth: '80mm' })}
                  className="hidden"
                />
                <div>
                  <div className="text-xs">80 mm (POS Desktop)</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    Lebar standar printer kasir USB/LAN
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Header Struk
              </label>
              <input
                type="text"
                placeholder="Contoh: Spesialis Kiloan & Satuan Bergaransi"
                value={form.headerNote}
                onChange={(e) => setForm({ ...form, headerNote: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pesan Footer Struk
              </label>
              <textarea
                rows={2}
                value={form.footerNote}
                onChange={(e) => setForm({ ...form, footerNote: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Syarat & Ketentuan Pengambilan (Terms)
            </label>
            <textarea
              rows={2}
              value={form.termsNote}
              onChange={(e) => setForm({ ...form, termsNote: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Section 3: Rekening Pembayaran */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-cyan-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Informasi Rekening Bank & QRIS Toko
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Rekening & Atas Nama (Ditampilkan di WhatsApp Tagihan Piutang)
            </label>
            <textarea
              rows={2}
              value={form.bankAccountInfo}
              onChange={(e) => setForm({ ...form, bankAccountInfo: e.target.value })}
              placeholder="Contoh: BCA 8720-192-881 a.n Fresh Laundry&#10;Mandiri 137-00-19283 a.n Fresh Laundry"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Save button & Demo Reset */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset ke Data Awal Demo
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Pengaturan Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};
