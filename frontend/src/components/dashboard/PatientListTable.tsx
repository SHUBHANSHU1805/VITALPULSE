import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Heart, Activity, Thermometer, ShieldAlert, ChevronRight, User } from 'lucide-react';

interface PatientListTableProps {
  patients: Patient[];
  isLoading: boolean;
}

export const PatientListTable: React.FC<PatientListTableProps> = ({ patients, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto text-clinical-teal mb-3" />
        <p className="font-semibold text-sm">Fetching patient roster telemetry...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="p-8 rounded-2xl glass-panel text-center text-slate-400">
        <User className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <p className="font-semibold text-base">No patients matching current clinical filter.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Patient Name & Ward</th>
              <th className="py-3.5 px-4">Demographics</th>
              <th className="py-3.5 px-4">Heart Rate</th>
              <th className="py-3.5 px-4">SpO2 Oxygen</th>
              <th className="py-3.5 px-4">Blood Pressure</th>
              <th className="py-3.5 px-4">AI Risk Triage</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {patients.map((patient) => {
              const vital = patient.latestVital;
              const isCritical = patient.riskLevel === 'CRITICAL' || (vital && vital.spo2 < 90);

              return (
                <tr
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    isCritical ? 'bg-rose-950/20' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 pulse-critical'
                            : 'bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/30'
                        }`}
                      >
                        {patient.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 flex items-center space-x-2">
                          <span>{patient.name}</span>
                          {patient.activeAlertCount && patient.activeAlertCount > 0 ? (
                            <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                              {patient.activeAlertCount} Alert
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-slate-400">
                          {patient.ward} • Room {patient.roomNumber}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-slate-300 text-xs">
                    {patient.age} yrs • {patient.gender}
                    <div className="text-[11px] text-slate-500 font-mono">Blood: {patient.bloodType || 'N/A'}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold">
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          vital && vital.heartRate > 100 ? 'text-rose-400 animate-bounce' : 'text-slate-400'
                        }`}
                      />
                      <span className={vital && vital.heartRate > 100 ? 'text-rose-400 font-extrabold' : 'text-slate-200'}>
                        {vital ? `${vital.heartRate} bpm` : '--'}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold">
                      <Activity
                        className={`w-3.5 h-3.5 ${
                          vital && vital.spo2 < 92 ? 'text-rose-400 animate-pulse' : 'text-clinical-teal'
                        }`}
                      />
                      <span className={vital && vital.spo2 < 92 ? 'text-rose-400 font-extrabold' : 'text-slate-200'}>
                        {vital ? `${vital.spo2}%` : '--'}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs font-mono font-medium text-slate-300">
                    {vital ? `${vital.bpSystolic}/${vital.bpDiastolic}` : '--'}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <StatusBadge level={patient.riskLevel} />
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {patient.riskScore}/100
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/patients/${patient.id}`);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-clinical-teal/20 hover:text-clinical-teal text-slate-400 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
