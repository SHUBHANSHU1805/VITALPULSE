import React from 'react';

interface StatusBadgeProps {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'SCHEDULED' | 'COMPLETED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ level }) => {
  const styles: Record<string, string> = {
    LOW:       'bg-emerald-500/12 text-emerald-400 border-emerald-500/30',
    MODERATE:  'bg-amber-500/12  text-amber-400  border-amber-500/30',
    HIGH:      'bg-orange-500/12 text-orange-400 border-orange-500/30',
    CRITICAL:  'bg-rose-500/15   text-rose-400   border-rose-500/45 animate-pulse font-extrabold',
    SCHEDULED: 'bg-blue-500/12   text-blue-400   border-blue-500/30',
    COMPLETED: 'bg-slate-700/50  text-slate-400  border-slate-700',
  };

  return (
    <span
      className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${styles[level] ?? styles.LOW}`}
    >
      {level}
    </span>
  );
};
