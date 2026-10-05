import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  PlusCircle,
  FileSpreadsheet,
  UserCheck,
  RefreshCw,
  Clock,
  Printer,
  Bell,
} from 'lucide-react';
import { NavigationMenu } from './Sidebar';

interface NavbarProps {
  currentMenu: NavigationMenu;
  onOpenMobileMenu: () => void;
  onSelectMenu: (menu: NavigationMenu) => void;
  onOpenSpreadsheetModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMenu,
  onOpenMobileMenu,
  onSelectMenu,
  onOpenSpreadsheetModal,
}) => {
  const {
    currentUser,
    switchUser,
    employees,
    transactions,
    setReceiptModalTrx,
    syncStatus,
    triggerGoogleSheetsSync,
    stats,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getMenuTitle = (menu: NavigationMenu) => {
    switch (menu) {
      case 'dashboard':
        return { title: 'Dashboard Ringkasan', subtitle: 'Monitoring omzet harian, status cucian & laba rugi' };
      case 'pos':
        return { title: 'Kasir & Transaksi Baru', subtitle: 'Input pesanan kiloan/satuan, timbangan, dan pembayaran' };
      case 'order_board':
        return { title: 'Papan Status Pesanan', subtitle: 'Lacak proses cuci, kering, setrika, siap diambil' };
      case 'payment_receivables':
        return { title: 'Piutang & Pembayaran', subtitle: 'Kelola uang muka (DP) dan sisa tagihan pelanggan' };
      case 'cash_management':
        return { title: 'Manajemen Kas & Tutup Buku', subtitle: 'Kontrol arus kas laci kasir dan serah terima shift' };
      case 'expenses':
        return { title: 'Pengeluaran Operasional', subtitle: 'Catat belanja detergen, plastik, listrik, air, dan gaji' };
      case 'inventory':
        return { title: 'Stok Bahan & Barang', subtitle: 'Kontrol persediaan detergen, pewangi, plastik, dan hanger' };
      case 'reports':
        return { title: 'Laporan Keuangan & Laba Rugi', subtitle: 'Rekapitulasi pemasukan, pengeluaran & laba bersih' };
      case 'customers':
        return { title: 'Data Master Pelanggan', subtitle: 'Buku kontak pelanggan dan riwayat transaksi' };
      case 'services':
        return { title: 'Master Layanan & Harga', subtitle: 'Daftar tarif kiloan, satuan, express, dan estimasi waktu' };
      case 'employees':
        return { title: 'Pegawai & Hak Akses', subtitle: 'Manajemen pengguna, akun kasir, dan peran hak akses' };
      case 'settings':
        return { title: 'Pengaturan Toko & Printer', subtitle: 'Profil outlet laundry, format struk, dan WhatsApp' };
    }
  };

  const { title, subtitle } = getMenuTitle(currentMenu);

  const handlePrintLastReceipt = () => {
    if (transactions.length > 0) {
      setReceiptModalTrx(transactions[0]);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Page Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base lg:text-lg font-bold text-slate-900 leading-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Right: Quick actions, Live Clock, User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action: Transaksi Baru (POS) */}
          {currentUser.role !== 'operator' && (
            <button
              onClick={() => onSelectMenu('pos')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-semibold text-xs rounded-xl shadow-sm shadow-cyan-600/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Transaksi Baru</span>
              <span className="md:hidden">Kasir</span>
            </button>
          )}

          {/* Quick Action: Cetak Struk Terakhir */}
          {transactions.length > 0 && currentUser.role !== 'operator' && (
            <button
              onClick={handlePrintLastReceipt}
              title="Cetak Struk Transaksi Terakhir"
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden lg:inline">Struk Terakhir</span>
            </button>
          )}

          {/* Google Sheets Sync trigger button */}
          <button
            onClick={onOpenSpreadsheetModal}
            title="Kelola Google Spreadsheet"
            className="p-2 sm:px-2.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden xl:inline">Google Sheets</span>
          </button>

          {/* User Switcher Dropdown */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200 rounded-xl p-1 transition-colors">
            <UserCheck className="w-4 h-4 text-slate-600 ml-1.5 hidden sm:block" />
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 px-2 py-1 pr-6 rounded-lg cursor-pointer focus:outline-none appearance-none"
              title="Ganti Akun Pengguna / Role"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role.toUpperCase()})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500 text-[10px]">
              ▼
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
