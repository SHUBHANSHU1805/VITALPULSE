import React from 'react';
import { Alert } from '../../types';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AlertService } from '../../services/api';

interface AlertSummaryPanelProps {
  alerts: Alert[];
  onAlertResolved: () => void;
}

export const AlertSummaryPanel: React.FC<AlertSummaryPanelProps> = ({ alerts, onAlertResolved }) => {
  const handleResolve = async (alertId: string) => {
    try {
      await AlertService.resolveAlert(alertId);
      onAlertResolved();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="p-5 rounded-2xl glass-panel border border-[rgba(59,130,246,0.12)] space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Active Alerts ({activeAlerts.length})
          </h3>
        </div>
        {activeAlerts.length > 0 && (
          <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25">
            REVIEW REQUIRED
          </span>
        )}
      </div>

      {activeAlerts.length === 0 ? (
        <div className="p-6 text-center text-slate-400 bg-[rgba(15,23,42,0.50)] rounded-xl border border-[rgba(59,130,246,0.08)]">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="text-xs font-semibold">All active alerts resolved.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {activeAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between transition-all ${
                  isCritical
                    ? 'bg-rose-950/30 border-rose-500/40 shadow-glow-rose'
                    : 'bg-amber-950/15 border-amber-500/25'
                }`}
              >
                {/* Left-border accent line (reference pattern) */}
                <div className={`w-1 self-stretch rounded-full mr-3 flex-shrink-0 ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`} />

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase ${isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {alert.patient?.name || alert.patientName || 'Patient'} · Rm {alert.patient?.roomNumber || alert.roomNumber || 'ICU'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{alert.message}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(alert.triggeredAt).toLocaleTimeString()}
                  </p>
                </div>

                <button
                  onClick={() => handleResolve(alert.id)}
                  className="ml-2 px-2.5 py-1 text-[11px] font-semibold bg-[rgba(15,23,42,0.80)] hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg transition-colors border border-[rgba(59,130,246,0.12)] flex-shrink-0"
                >
                  Resolve
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
