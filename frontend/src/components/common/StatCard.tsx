import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'rose' | 'emerald' | 'amber' | 'indigo' | 'teal';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}) => {
  const colorStyles: Record<string, string> = {
    blue:    'from-blue-500/20    to-blue-900/5    border-blue-500/25    text-blue-400',
    indigo:  'from-indigo-500/20  to-indigo-900/5  border-indigo-500/25  text-indigo-400',
    rose:    'from-rose-500/20    to-rose-900/5    border-rose-500/25    text-rose-400',
    emerald: 'from-emerald-500/20 to-emerald-900/5 border-emerald-500/25 text-emerald-400',
    amber:   'from-amber-500/20   to-amber-900/5   border-amber-500/25   text-amber-400',
    // Legacy alias
    teal:    'from-blue-500/20    to-blue-900/5    border-blue-500/25    text-blue-400',
  };

  const glowStyles: Record<string, string> = {
    blue:    'shadow-glow-blue',
    indigo:  'shadow-glow-indigo',
    rose:    'shadow-glow-rose',
    emerald: '',
    amber:   '',
    teal:    'shadow-glow-blue',
  };

  return (
    <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-start justify-between relative overflow-hidden">
      {/* Ambient corner glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ background: color === 'rose' ? '#F43F5E' : color === 'amber' ? '#F59E0B' : color === 'emerald' ? '#10B981' : '#3B82F6' }}
      />

      <div className="space-y-1 z-10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend && (
          <p className="text-[11px] font-semibold text-emerald-400 mt-1">↑ {trend} from previous</p>
        )}
      </div>

      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorStyles[color]} border shadow-md ${glowStyles[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
