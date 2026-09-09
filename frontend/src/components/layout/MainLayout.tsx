import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Language } from '../../i18n/translations';

interface MainLayoutProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: string;
  onRoleChange: (role: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  language,
  onLanguageChange,
  userRole,
  onRoleChange
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-matrix-black text-slate-100">
      <Navbar
        language={language}
        onLanguageChange={onLanguageChange}
        userRole={userRole}
        onRoleChange={onRoleChange}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar language={language} />
        <main className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-panel/30 via-matrix-black to-matrix-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
