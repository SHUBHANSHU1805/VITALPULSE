import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Video, ShieldAlert, FileText, Settings, Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Patient Roster', path: '/patients', icon: Users },
    { label: 'Telehealth & Calls', path: '/consultations', icon: Video },
  ];

  return (
    <aside className="w-64 bg-[#0F172A]/90 border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Clinician Navigation
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-clinical-teal/20 to-clinical-cyan/10 border border-clinical-teal/40 text-clinical-teal shadow-glow-teal'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System info widget in sidebar */}
      <div className="p-3.5 rounded-xl glass-panel text-xs space-y-2 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Ward Unit</span>
          <span className="text-emerald-400 font-semibold">ICU / CARDIOLOGY</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">AI Model</span>
          <span className="text-clinical-teal font-semibold">XGBoost v1.4</span>
        </div>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Engine Status</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>
    </aside>
  );
};
