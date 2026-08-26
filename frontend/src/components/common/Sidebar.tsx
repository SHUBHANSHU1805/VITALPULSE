import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Video, BarChart2, Shield, Settings, Sun } from 'lucide-react';

const ICONS = [
  { icon: LayoutDashboard, path: '/dashboard',     tip: 'Overview' },
  { icon: Users,           path: '/patients',      tip: 'Patients' },
  { icon: Video,           path: '/consultations', tip: 'Telehealth' },
  { icon: BarChart2,       path: '/dashboard',     tip: 'Analytics' },
  { icon: Shield,          path: '/dashboard',     tip: 'Security' },
  { icon: Settings,        path: '/dashboard',     tip: 'Settings' },
];

export const Sidebar: React.FC = () => (
  <aside className="w-[60px] flex flex-col items-center py-4 gap-1 border-r border-[#1A2744] bg-[#070D1B] min-h-[calc(100vh-3.5rem)]">
    {ICONS.map(({ icon: Icon, path, tip }) => (
      <NavLink key={tip} to={path} title={tip}
        className={({ isActive }) =>
          `w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
            isActive ? 'sidebar-icon-active' : 'text-vs-dim hover:text-vs-text hover:bg-[#0B1329]'
          }`
        }
      >
        <Icon className="w-4.5 h-4.5" size={18} />
      </NavLink>
    ))}

    {/* Bottom: theme toggle */}
    <div className="mt-auto">
      <button className="w-10 h-10 flex items-center justify-center rounded-xl text-vs-dim hover:text-vs-text hover:bg-[#0B1329] transition-all">
        <Sun size={16} />
      </button>
    </div>
  </aside>
);
