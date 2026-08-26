import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, ChevronDown, AlertTriangle } from 'lucide-react';
import { getSocket } from '../../services/api';
import { Alert } from '../../types';

const NAV = [
  { label: 'Overview',  path: '/dashboard' },
  { label: 'Patients',  path: '/patients' },
  { label: 'Telehealth',path: '/consultations' },
  { label: 'Analytics', path: '/dashboard' },
];

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('new_alert', (a: Alert) => setAlerts(p => [a, ...p].slice(0, 5)));
    return () => { socket.off('new_alert'); };
  }, []);

  return (
    <header className="h-14 flex items-center px-5 gap-6 border-b border-[#1A2744] bg-[#070D1B]/90 backdrop-blur-xl sticky top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 min-w-[140px] cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path d="M10 2L12 8H18L13 12L15 18L10 14L5 18L7 12L2 8H8L10 2Z" fill="white"/>
          </svg>
        </div>
        <span className="text-base font-bold text-gradient-brand tracking-wide">VitalPulse</span>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1 justify-center">
        {NAV.map(n => (
          <NavLink key={n.label} to={n.path}
            className={({ isActive }) =>
              `relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'nav-active text-vs-cyan' : 'text-vs-dim hover:text-vs-text'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-3 min-w-[240px] justify-end">
        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 bg-[#0B1329] border border-[#1A2744] rounded-lg px-3 py-1.5 w-44">
          <Search className="w-3.5 h-3.5 text-vs-dim" />
          <input placeholder="Search patients..." className="bg-transparent text-xs text-vs-text placeholder-vs-dim outline-none w-full" />
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-lg bg-[#0B1329] border border-[#1A2744] hover:border-vs-cyan/30 transition-colors">
          <Bell className="w-4 h-4 text-vs-dim" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-vs-rose rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={logout}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-vs-cyan to-vs-purple flex items-center justify-center text-[11px] font-bold text-white">
            {user?.name?.slice(0,2).toUpperCase() ?? 'DR'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-vs-text leading-none">{user?.name ?? 'Dr. Alex Morgan'}</p>
            <p className="text-[10px] text-vs-dim mt-0.5">{user?.role ?? 'Chief Medical Officer'}</p>
          </div>
          <ChevronDown className="w-3 h-3 text-vs-dim" />
        </div>
      </div>
    </header>
  );
};
