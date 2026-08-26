import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Video, Activity } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Overview',         path: '/dashboard',     icon: LayoutDashboard },
    { label: 'Patient Roster',   path: '/patients',      icon: Users },
    { label: 'Telehealth & Calls', path: '/consultations', icon: Video },
  ];

  return (
    <aside className="w-64 bg-[#0B1120]/95 border-r border-[rgba(59,130,246,0.10)] flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Clinician Navigation
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-500/10 border border-blue-500/30 text-blue-400 shadow-glow-blue'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[rgba(59,130,246,0.06)] border border-transparent'
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

      {/* System status widget */}
      <div className="p-3.5 rounded-xl glass-panel border border-[rgba(59,130,246,0.12)] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Ward Unit</span>
          <span className="text-emerald-400 font-semibold">ICU / CARDIOLOGY</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">AI Model</span>
          <span className="text-blue-400 font-semibold">XGBoost v1.4</span>
        </div>
        <div className="pt-2 border-t border-[rgba(59,130,246,0.10)] flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center space-x-1.5">
            <Activity className="w-3 h-3" />
            <span>Engine Status</span>
          </span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>ONLINE</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
