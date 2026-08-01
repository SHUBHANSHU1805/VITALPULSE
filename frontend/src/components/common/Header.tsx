import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Activity, ShieldAlert, User, LogOut, HeartPulse } from 'lucide-react';
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
    <header className="sticky top-0 z-30 h-16 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between shadow-lg">
      {/* Left: Branding title & Telemetry status indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-clinical-teal/20 to-clinical-cyan/20 border border-clinical-teal/40 text-clinical-teal shadow-glow-teal">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-lg font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-teal-100 to-clinical-teal">
            VITALPULSE
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-clinical-teal/10 border border-clinical-teal/30 text-clinical-teal">
            CLINICAL MVP
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>Live Telemetry Engine ({livePings} events)</span>
        </div>
      </div>

      {/* Center: Floating Toast Notification for Critical Vitals Alerts */}
      {showAlertToast && recentAlert && (
        <div className="hidden lg:flex items-center space-x-3 px-4 py-1.5 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs animate-bounce shadow-glow-rose">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-spin" />
          <span className="font-semibold">{recentAlert.message}</span>
        </div>
      )}

      {/* Right: User Profile & Actions */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0F172A]"></span>
          </button>
        </div>

        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-clinical-teal to-clinical-cyan p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-clinical-teal font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200">{user?.name || 'Dr. Sarah Jenkins'}</p>
            <p className="text-[10px] text-clinical-teal uppercase tracking-wider font-semibold">{user?.role || 'DOCTOR'}</p>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
