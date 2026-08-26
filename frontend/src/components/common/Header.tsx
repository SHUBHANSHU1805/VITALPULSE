import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, ShieldAlert, LogOut, HeartPulse } from 'lucide-react';
import { getSocket } from '../../services/api';
import { Alert } from '../../types';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [livePings, setLivePings] = useState<number>(0);
  const [recentAlert, setRecentAlert] = useState<Alert | null>(null);
  const [showAlertToast, setShowAlertToast] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.on('patient_telemetry_ping', () => {
      setLivePings((prev) => prev + 1);
    });

    socket.on('new_alert', (newAlert: Alert) => {
      setRecentAlert(newAlert);
      setShowAlertToast(true);
      setTimeout(() => setShowAlertToast(false), 7000);
    });

    return () => {
      socket.off('patient_telemetry_ping');
      socket.off('new_alert');
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B1120]/85 backdrop-blur-xl border-b border-[rgba(59,130,246,0.12)] px-6 flex items-center justify-between shadow-lg">
      {/* Left: Brand + live status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          {/* Logo icon — blue gradient square */}
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600/25 to-indigo-500/20 border border-blue-500/30 text-blue-400 shadow-glow-blue">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="text-lg font-extrabold tracking-wider text-gradient-blue">
            VITALPULSE
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400">
            CLINICAL
          </span>
        </div>

        {/* Live telemetry indicator */}
        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-[rgba(59,130,246,0.15)] text-xs text-slate-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span>Live Telemetry ({livePings} events)</span>
        </div>
      </div>

      {/* Center: Critical alert toast */}
      {showAlertToast && recentAlert && (
        <div className="hidden lg:flex items-center space-x-3 px-4 py-1.5 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs shadow-glow-rose">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-spin" />
          <span className="font-semibold">{recentAlert.message}</span>
        </div>
      )}

      {/* Right: Bell + user */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button className="p-2 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 transition-colors border border-[rgba(59,130,246,0.12)] relative">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0B1120]"></span>
          </button>
        </div>

        <div className="flex items-center space-x-3 pl-3 border-l border-[rgba(59,130,246,0.12)]">
          {/* Avatar: circular with blue gradient ring (reference style) */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-glow-blue">
            <div className="w-full h-full bg-[#0F172A] rounded-full flex items-center justify-center text-blue-400 font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200">{user?.name || 'Dr. Sarah Jenkins'}</p>
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">{user?.role || 'DOCTOR'}</p>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-lg bg-[#0F172A]/60 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 transition-colors border border-transparent hover:border-rose-500/30"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
