import React from 'react';
import { RiskFactor } from '../../types';
import { BrainCircuit, Info, AlertTriangle } from 'lucide-react';

interface RiskScoreCardProps {
  score: number;
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  topFactors: RiskFactor[];
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ score, level, topFactors }) => {
  const getGaugeColor = (val: number) => {
    if (val >= 75) return 'from-rose-500 to-rose-700 text-rose-400';
    if (val >= 50) return 'from-amber-500 to-orange-600 text-amber-400';
    if (val >= 25) return 'from-yellow-400 to-amber-500 text-yellow-300';
    return 'from-emerald-400 to-teal-500 text-emerald-400';
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-clinical-teal" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            AI Risk Score & Explainability
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-clinical-teal/10 border border-clinical-teal/30 text-clinical-teal">
          SHAP EXPLAINER v1.2
        </span>
      </div>

      {/* Score Circular Gauge Display */}
      <div className="flex items-center justify-around p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="text-center">
          <div className={`text-4xl font-black font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${getGaugeColor(score)}`}>
            {score}<span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Clinical Deterioration Score
          </p>
        </div>

        <div className="h-10 w-px bg-slate-800"></div>

        <div className="text-left space-y-1">
          <div className="text-xs font-semibold text-slate-400">Triage Classification</div>
          <span
            className={`inline-block px-3 py-1 text-xs font-black rounded-lg border uppercase tracking-wider ${
              level === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                : level === 'HIGH'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {level} RISK
          </span>
        </div>
      </div>

      {/* SHAP Feature Contribution List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Top Contributing Risk Features</span>
          <span>SHAP Impact</span>
        </div>

        {topFactors.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No significant risk factors identified.</p>
        ) : (
          <div className="space-y-2">
            {topFactors.map((factor, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-200 font-medium">{factor.feature}</span>
                </div>
                <span className="font-mono font-bold text-amber-400">+{(factor.contribution * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
