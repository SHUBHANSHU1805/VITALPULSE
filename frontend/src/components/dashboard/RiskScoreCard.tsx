import React from 'react';
import { RiskFactor } from '../../types';
import { BrainCircuit, AlertTriangle } from 'lucide-react';

interface RiskScoreCardProps {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  topFactors: RiskFactor[];
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ score, level, topFactors }) => {
  /** Gauge ring color based on score */
  const getScoreStyle = (val: number) => {
    if (val >= 75) return { text: 'text-rose-400',    ring: '#F43F5E', bg: 'bg-rose-500/10',    border: 'border-rose-500/25' };
    if (val >= 50) return { text: 'text-amber-400',   ring: '#F59E0B', bg: 'bg-amber-500/10',   border: 'border-amber-500/25' };
    if (val >= 25) return { text: 'text-yellow-400',  ring: '#EAB308', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25' };
    return              { text: 'text-emerald-400', ring: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' };
  };

  const scoreStyle = getScoreStyle(score);

  /** SVG donut arc for the score gauge */
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <div className="p-6 rounded-2xl glass-panel border border-[rgba(59,130,246,0.12)] space-y-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            AI Risk Score
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
          SHAP v1.2
        </span>
      </div>

      {/* Score gauge + triage level */}
      <div className="flex items-center justify-around p-4 rounded-xl bg-[rgba(15,23,42,0.55)] border border-[rgba(59,130,246,0.08)]">
        {/* SVG donut gauge (reference-style circular indicator) */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
            {/* Track */}
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="10" />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r={radius} fill="none"
              stroke={scoreStyle.ring} strokeWidth="10"
              strokeDasharray={`${circumference - progress} ${progress}`}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${scoreStyle.ring}66)` }}
            />
          </svg>
          {/* Score number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black font-mono ${scoreStyle.text}`}>{score}</span>
            <span className="text-[10px] text-slate-500">/100</span>
          </div>
        </div>

        <div className="h-10 w-px bg-[rgba(59,130,246,0.12)]"></div>

        {/* Triage level */}
        <div className="text-left space-y-2">
          <div className="text-xs font-semibold text-slate-400">Triage Classification</div>
          <span className={`inline-block px-3 py-1.5 text-xs font-black rounded-full border uppercase tracking-wider ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border} ${level === 'CRITICAL' ? 'animate-pulse' : ''}`}>
            {level} RISK
          </span>
          <p className="text-[11px] text-slate-500">Clinical Deterioration Score</p>
        </div>
      </div>

      {/* SHAP factor bars */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Top Contributing Risk Features</span>
          <span>SHAP Impact</span>
        </div>

        {topFactors.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No significant risk factors identified.</p>
        ) : (
          <div className="space-y-2">
            {topFactors.map((factor, idx) => {
              const pct = Math.min(100, (factor.contribution * 100).toFixed(0) as unknown as number);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-slate-200 font-medium">{factor.feature}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400">+{pct}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 rounded-full bg-[rgba(30,41,59,0.8)]">
                    <div
                      className="h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
