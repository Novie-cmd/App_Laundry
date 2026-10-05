import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  KanbanSquare,
  Users,
  Sparkles,
  CreditCard,
  DollarSign,
  Package,
  Receipt,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

export type NavigationMenu =
  | 'dashboard'
  | 'pos'
  | 'order_board'
  | 'payment_receivables'
  | 'cash_management'
  | 'expenses'
  | 'inventory'
  | 'reports'
  | 'customers'
  | 'services'
  | 'employees'
  | 'settings';

interface SidebarProps {
  currentMenu: NavigationMenu;
  onSelectMenu: (menu: NavigationMenu) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenSpreadsheetModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMenu,
  onSelectMenu,
  isOpen,
  onCloseMobile,
  onOpenSpreadsheetModal,
}) => {
  const { currentUser, stats, settings } = useApp();
  const role = currentUser.role;

  // Filter allowed menus based on user role
  const isAllowed = (menu: NavigationMenu): boolean => {
    if (role === 'owner') return true;
    if (role === 'admin') {
      return menu !== 'employees' && menu !== 'settings';
    }
    if (role === 'kasir') {
      return (
        menu === 'dashboard' ||
        menu === 'pos' ||
        menu === 'order_board' ||
        menu === 'payment_receivables' ||
        menu === 'cash_management' ||
        menu === 'customers'
      );
    }
    if (role === 'operator') {
      return menu === 'order_board' || menu === 'inventory';
    }
    return false;
  };

  const navItems: {
    section?: string;
    items: {
      id: NavigationMenu;
      label: string;
      icon: React.ElementType;
      badge?: number | string;
      badgeColor?: string;
    }[];
  }[] = [
    {
      section: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pos', label: 'Kasir / Transaksi', icon: ShoppingCart },
        {
          id: 'order_board',
          label: 'Status Pesanan',
          icon: KanbanSquare,
          badge: stats.pendingOrdersCount,
          badgeColor: 'bg-cyan-500 text-white',
        },
      ],
    },
    {
      section: 'KEUANGAN & KAS',
      items: [
        {
          id: 'payment_receivables',
          label: 'Piutang & Pembayaran',
          icon: CreditCard,
          badge: stats.totalReceivables > 0 ? 'Ada Piutang' : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { id: 'cash_management', label: 'Manajemen Kas', icon: DollarSign },
        { id: 'expenses', label: 'Pengeluaran', icon: TrendingDown },
        { id: 'reports', label: 'Laporan Keuangan', icon: Receipt },
      ],
    },
    {
      section: 'OPERASIONAL & STOK',
      items: [
        {
          id: 'inventory',
          label: 'Stok Bahan & Barang',
          icon: Package,
          badge: stats.lowStockCount > 0 ? stats.lowStockCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
      ],
    },
    {
      section: 'DATA MASTER',
      items: [
        { id: 'customers', label: 'Data Pelanggan', icon: Users },
        { id: 'services', label: 'Master Layanan & Harga', icon: Layers },
        { id: 'employees', label: 'Pegawai & Hak Akses', icon: ShieldCheck },
      ],
    },
    {
      section: 'SISTEM',
      items: [{ id: 'settings', label: 'Pengaturan Toko', icon: Settings }],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-tight text-white truncate">
                {settings.storeName || 'FRESHWASH'}
              </h1>
              <p className="text-[11px] text-cyan-400 font-medium">Laundry POS & Sheets</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navItems.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => isAllowed(item.id));
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {group.section && (
                  <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {group.section}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectMenu(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-semibold shadow-md shadow-cyan-950/40'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Google Sheets Quick Sync Widget */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onOpenSpreadsheetModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/90 hover:bg-emerald-950/50 border border-slate-700 hover:border-emerald-600/50 text-slate-200 hover:text-emerald-300 transition-all text-left text-xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-[11px] leading-tight text-white">Google Sheets</div>
                <div className="text-[10px] text-emerald-400">Sinkronisasi Database</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* User Profile & Role Info */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-cyan-400 uppercase font-mono font-semibold">
                Role: {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
