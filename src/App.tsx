import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavigationMenu } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PosTransactionView } from './components/pos/PosTransactionView';
import { OrderBoardView } from './components/orders/OrderBoardView';
import { PaymentReceivablesView } from './components/payment/PaymentReceivablesView';
import { CashManagementView } from './components/cash/CashManagementView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { InventoryView } from './components/inventory/InventoryView';
import { FinancialReportsView } from './components/reports/FinancialReportsView';
import { CustomersMasterView } from './components/master/CustomersMasterView';
import { ServicesMasterView } from './components/master/ServicesMasterView';
import { EmployeesMasterView } from './components/master/EmployeesMasterView';
import { SettingsView } from './components/settings/SettingsView';
import { ThermalReceiptModal } from './components/receipt/ThermalReceiptModal';
import { WhatsAppNotificationModal } from './components/whatsapp/WhatsAppNotificationModal';
import { QuickPaymentModal } from './components/payment/QuickPaymentModal';
import { GoogleSpreadsheetSyncModal } from './components/spreadsheet/GoogleSpreadsheetSyncModal';

const MainLayout: React.FC = () => {
  const [currentMenu, setCurrentMenu] = useState<NavigationMenu>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentMenu) {
      case 'dashboard':
        return <DashboardView onNavigate={(menu) => setCurrentMenu(menu)} />;
      case 'pos':
        return <PosTransactionView />;
      case 'order_board':
        return <OrderBoardView />;
      case 'payment_receivables':
        return <PaymentReceivablesView />;
      case 'cash_management':
        return <CashManagementView />;
      case 'expenses':
        return <ExpensesView />;
      case 'inventory':
        return <InventoryView />;
      case 'reports':
        return <FinancialReportsView />;
      case 'customers':
        return <CustomersMasterView />;
      case 'services':
        return <ServicesMasterView />;
      case 'employees':
        return <EmployeesMasterView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(menu) => setCurrentMenu(menu)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentMenu={currentMenu}
        onSelectMenu={(menu) => setCurrentMenu(menu)}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentMenu={currentMenu}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSelectMenu={(menu) => setCurrentMenu(menu)}
          onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <ThermalReceiptModal />
      <WhatsAppNotificationModal />
      <QuickPaymentModal />
      <GoogleSpreadsheetSyncModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
