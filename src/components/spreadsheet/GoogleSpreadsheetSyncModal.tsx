import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  X,
  ExternalLink,
  Code2,
  Database,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSpreadsheetSyncModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    exportSheetAsCSV,
    exportAllSheetsAsCSV,
    triggerGoogleSheetsSync,
    syncStatus,
    transactions,
    customers,
    services,
    expenses,
    cashTransactions,
    products,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'export' | 'script' | 'config'>('export');
  const [scriptUrl, setScriptUrl] = useState(settings.googleScriptUrl || '');
  const [sheetId, setSheetId] = useState(settings.googleSheetId || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    updateSettings({
      googleScriptUrl: scriptUrl,
      googleSheetId: sheetId,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSync = async () => {
    await triggerGoogleSheetsSync();
  };

  const appScriptSampleCode = `/**
 * Google Apps Script - FreshWash Laundry Auto-Sync Webhook
 * 1. Buka Google Sheets baru di Google Drive Anda
 * 2. Klik Extensions -> Apps Script
 * 3. Hapus kode bawaan dan paste kode di bawah ini
 * 4. Klik Deploy -> New Deployment -> Select type: Web App
 * 5. Set 'Who has access' -> 'Anyone'
 * 6. Salin Web App URL ke aplikasi Laundry Anda di tab Pengaturan Spreadsheet!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Sinkronisasi Tabel Transaksi
    if (data.transactions) {
      var sheetTrx = getOrCreateSheet(ss, "TRANSACTIONS");
      if (sheetTrx.getLastRow() === 0) {
        sheetTrx.appendRow(["Invoice", "Tanggal", "Pelanggan", "Grand Total", "Terbayar", "Sisa", "Metode", "Status Bayar", "Status Laundry", "Kasir"]);
      }
      data.transactions.forEach(function(t) {
        sheetTrx.appendRow([t.invoiceNumber, t.date, t.customerName, t.grandTotal, t.paidAmount, t.remainingAmount, t.paymentMethod, t.paymentStatus, t.status, t.cashierName]);
      });
    }

    // Sinkronisasi Tabel Pelanggan
    if (data.customers) {
      var sheetCust = getOrCreateSheet(ss, "CUSTOMERS");
      if (sheetCust.getLastRow() === 0) {
        sheetCust.appendRow(["ID Pelanggan", "Nama", "No HP", "Alamat", "Catatan", "Total Order"]);
      }
      data.customers.forEach(function(c) {
        sheetCust.appendRow([c.id, c.name, c.phone, c.address, c.notes, c.totalOrders]);
      });
    }

    // Sinkronisasi Tabel Pengeluaran
    if (data.expenses) {
      var sheetExp = getOrCreateSheet(ss, "EXPENSES");
      if (sheetExp.getLastRow() === 0) {
        sheetExp.appendRow(["ID", "Tanggal", "Kategori", "Jumlah", "Keterangan", "Kasir"]);
      }
      data.expenses.forEach(function(x) {
        sheetExp.appendRow([x.id, x.date, x.category, x.amount, x.description, x.recordedBy]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", timestamp: new Date() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name) {
  var s = ss.getSheetByName(name);
  if (!s) {
    s = ss.insertSheet(name);
  }
  return s;
}`;

  const copyScriptCode = () => {
    navigator.clipboard.writeText(appScriptSampleCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sheetsInfo = [
    { id: 'transactions', name: 'TRANSACTIONS', count: transactions.length, desc: 'Daftar semua nota transaksi laundry' },
    { id: 'customers', name: 'CUSTOMERS', count: customers.length, desc: 'Master pelanggan & kontak WhatsApp' },
    { id: 'services', name: 'SERVICES', count: services.length, desc: 'Master layanan, harga kiloan/satuan & estimasi' },
    { id: 'expenses', name: 'EXPENSES', count: expenses.length, desc: 'Catatan pengeluaran operasional laundry' },
    { id: 'cash_transactions', name: 'CASH_TRANSACTIONS', count: cashTransactions.length, desc: 'Mutasi arus kas masuk & keluar laci' },
    { id: 'products', name: 'PRODUCTS / STOK', count: products.length, desc: 'Master bahan detergen, pewangi, plastik, dll' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="font-semibold text-lg">Pusat Integrasi Google Spreadsheet</h3>
              <p className="text-xs text-emerald-100">
                Ekspor tabel, sinkronisasi webhook otomatis, dan template database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            Ekspor CSV / Sheet (Semua Tabel)
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Koneksi Webhook / Sync
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'script'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Template Apps Script
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-6">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">
                    Ekspor Tabel Database ke Google Spreadsheet / Excel
                  </h4>
                  <p className="text-xs text-slate-500">
                    File CSV yang diekspor kompatibel langsung dibuka di Google Sheets atau Microsoft Excel dengan format UTF-8.
                  </p>
                </div>
                <button
                  onClick={exportAllSheetsAsCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Ekspor Semua Sekaligus
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {sheetsInfo.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-xs text-slate-900">{s.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                          {s.count} baris
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{s.desc}</p>
                    </div>
                    <button
                      onClick={() => exportSheetAsCSV(s.id)}
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                      title={`Download ${s.name}.csv`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                <span className="font-semibold">Koneksi Otomatis Google Sheets:</span> Anda dapat menghubungkan Google Spreadsheet milik toko laundry Anda dengan memasukkan URL Google Apps Script Web App di bawah ini. Setiap kali transaksi baru atau sinkronisasi dijalankan, data otomatis terkirim ke spreadsheet Anda!
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Apps Script Web App URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={scriptUrl}
                    onChange={(e) => setScriptUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dapatkan URL ini dari menu Deploy Web App di Google Apps Script (lihat tab &apos;Template Apps Script&apos;).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Spreadsheet ID (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSync}
                    disabled={syncStatus.isSyncing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                    {syncStatus.isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                  </button>
                  {syncStatus.lastSyncTime && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tersinkron pukul {syncStatus.lastSyncTime}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  {saveSuccess ? 'Tersimpan!' : 'Simpan Konfigurasi'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Salin script di bawah ini ke <b>Extensions &gt; Apps Script</b> di Google Spreadsheet Anda untuk otomatis menerima data:
                </p>
                <button
                  onClick={copyScriptCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors border border-slate-300"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Script Tersalin!' : 'Salin Script'}
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-60 overflow-y-auto leading-relaxed border border-slate-800">
                <pre>{appScriptSampleCode}</pre>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <p>💡 <b>Langkah Aktivasi:</b></p>
                <ol className="list-decimal list-inside space-y-0.5 ml-1">
                  <li>Buat Spreadsheet kosong di Google Drive.</li>
                  <li>Buka Extensions &gt; Apps Script, tempel kode di atas lalu simpan.</li>
                  <li>Klik tombol &quot;Deploy&quot; &gt; &quot;New Deployment&quot; &gt; pilih jenis &quot;Web App&quot;.</li>
                  <li>Atur &quot;Who has access&quot; ke &quot;Anyone&quot;.</li>
                  <li>Salin Web App URL dan tempelkan ke tab &quot;Koneksi Webhook / Sync&quot;.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
