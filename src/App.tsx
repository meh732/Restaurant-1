/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Store, UtensilsCrossed, BarChart3, Settings, Users } from 'lucide-react';
import POSScreen from './components/POS/POSScreen';
import MenuManagerScreen from './components/MenuManager/MenuManagerScreen';
import ReportsScreen from './components/Reports/ReportsScreen';
import SettingsScreen from './components/Settings/SettingsScreen';
import CustomersScreen from './components/Customers/CustomersScreen';
import { db } from './lib/db';
import arkaLogo from './assets/images/arka_logo.png';

export type TabType = 'pos' | 'menu' | 'reports' | 'customers' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('pos');

  // Initialize default settings on first load
  useEffect(() => {
    const initSettings = async () => {
      const settingsCount = await db.settings.count();
      if (settingsCount === 0) {
        await db.settings.add({
          restaurantName: 'فروشگاه من',
          phone: '',
          address: '',
          website: '',
          instagram: '',
          telegram: '',
          logoUrl: '',
          taxEnabled: false,
          taxPercentage: 9,
          requireCustomerPhone: false
        });
      }
    };
    initSettings();
  }, []);

  const NavButton = ({ tab, icon: Icon, label, mobile }: { tab: TabType, icon: any, label: string, mobile?: boolean }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center transition-all duration-200 ${
        mobile 
          ? `flex-1 py-1 h-full ${activeTab === tab ? 'text-blue-600 font-bold' : 'text-slate-500'}`
          : `p-4 rounded-xl w-20 h-20 ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
            }`
      }`}
    >
      <Icon size={mobile ? 20 : 28} className={mobile ? 'mb-0.5' : 'mb-2'} />
      <span className={mobile ? 'text-[10px]' : 'text-sm font-medium'}>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen max-w-full bg-slate-100 overflow-hidden">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex w-28 bg-white border-l border-slate-200 flex-col items-center py-6 gap-4 shadow-sm z-10 shrink-0">
        <div className="mb-8 flex flex-col items-center gap-1 shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white flex items-center justify-center p-0.5">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
                <filter id="logo-glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.2" />
                </filter>
              </defs>
              <rect width="100" height="100" rx="20" fill="url(#logo-grad)" />
              <circle cx="50" cy="50" r="32" stroke="white" strokeWidth="2.5" strokeOpacity="0.15" strokeDasharray="6 4" />
              <path 
                d="M50 28 L68 68 H58 L50 48 L42 68 H32 L50 28 Z" 
                fill="white" 
                filter="url(#logo-glow)"
              />
              <path 
                d="M45 58 H55" 
                stroke="white" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <circle cx="50" cy="42" r="3" fill="#38bdf8" />
            </svg>
          </div>
          <span className="text-[12px] font-bold text-blue-600 mt-1.5">آرکا</span>
        </div>
        
        <NavButton tab="pos" icon={Store} label="فروشگاه" />
        <NavButton tab="menu" icon={UtensilsCrossed} label="مدیریت منو" />
        <NavButton tab="reports" icon={BarChart3} label="گزارشات" />
        <NavButton tab="customers" icon={Users} label="مشتریان" />
        <NavButton tab="settings" icon={Settings} label="تنظیمات" />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 max-w-full flex flex-col h-[calc(100vh-4rem)] md:h-full overflow-hidden">
        {activeTab === 'pos' && <POSScreen />}
        {activeTab === 'menu' && <MenuManagerScreen />}
        {activeTab === 'reports' && <ReportsScreen />}
        {activeTab === 'customers' && <CustomersScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="flex md:hidden bg-white border-t border-slate-200 h-16 shrink-0 z-30 justify-around items-center px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] w-full">
        <NavButton tab="pos" icon={Store} label="فروشگاه" mobile />
        <NavButton tab="menu" icon={UtensilsCrossed} label="مدیریت" mobile />
        <NavButton tab="reports" icon={BarChart3} label="گزارش" mobile />
        <NavButton tab="customers" icon={Users} label="مشتریان" mobile />
        <NavButton tab="settings" icon={Settings} label="تنظیمات" mobile />
      </nav>
    </div>
  );
}
