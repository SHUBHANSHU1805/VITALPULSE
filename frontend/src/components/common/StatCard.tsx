import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'teal' | 'rose' | 'emerald' | 'amber';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  trend,
}) => {
  const colorStyles = {
    teal: 'from-clinical-teal/20 to-clinical-cyan/10 border-clinical-teal/30 text-clinical-teal',
    rose: 'from-rose-500/20 to-rose-900/10 border-rose-500/30 text-rose-400',
    emerald: 'from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-900/10 border-amber-500/30 text-amber-400',
  };

  return (
    <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-start justify-between relative overflow-hidden">
      <div className="space-y-1 z-10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend && (
          <p className="text-[11px] font-semibold text-emerald-400 mt-1">
            ↑ {trend} from previous round
          </p>
        )}
      </div>

      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorStyles[color]} border shadow-md`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
