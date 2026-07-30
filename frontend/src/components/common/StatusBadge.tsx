import React from 'react';

interface StatusBadgeProps {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'SCHEDULED' | 'COMPLETED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ level }) => {
  const styles = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MODERATE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse font-extrabold',
    SCHEDULED: 'bg-clinical-teal/10 text-clinical-teal border-clinical-teal/30',
    COMPLETED: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${styles[level] || styles.LOW}`}>
      {level}
    </span>
  );
};
