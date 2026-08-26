import React, { useState, useEffect } from 'react';
import { PatientService, AlertService } from '../services/api';
import { Patient, Alert } from '../types';
import { StatCard } from '../components/common/StatCard';
import { PatientListTable } from '../components/dashboard/PatientListTable';
import { AlertSummaryPanel } from '../components/dashboard/AlertSummaryPanel';
import { VitalsStreamChart } from '../components/dashboard/VitalsStreamChart';
import { Users, ShieldAlert, BrainCircuit, Search } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');

  const fetchData = async () => {
    try {
      const [patientRes, alertRes] = await Promise.all([
        PatientService.getAllPatients({ search: searchQuery, ward: selectedWard }),
        AlertService.getAlerts({ resolved: false }),
      ]);
      setPatients(patientRes);
      setAlerts(alertRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [searchQuery, selectedWard]);

  const samplePatient = patients.find((p) => p.name === 'Eleanor Vance') || patients[0];
  const activeAlertCount = alerts.filter((a) => !a.resolved).length;
  const criticalPatientCount = patients.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Page title + filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-wide">Clinician Command Center</h1>
          <p className="text-xs text-slate-400">Real-Time Telemetry & AI Patient Risk Scoring</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, room..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[rgba(15,23,42,0.80)] border border-[rgba(59,130,246,0.15)] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[rgba(15,23,42,0.80)] border border-[rgba(59,130,246,0.15)] text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 font-semibold transition-all"
          >
            <option value="ALL">All Wards</option>
            <option value="ICU">ICU Unit</option>
            <option value="CARDIOLOGY">Cardiology</option>
            <option value="PULMONOLOGY">Pulmonology</option>
            <option value="GENERAL WARD">General Ward</option>
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monitored Patients" value={patients.length}     subtitle="Active telemetry beds"       icon={Users}       color="blue"    />
        <StatCard title="Critical & High Risk" value={criticalPatientCount} subtitle="Requires immediate review"  icon={ShieldAlert} color="rose"    />
        <StatCard title="Active Vitals Alerts" value={activeAlertCount}   subtitle="Unresolved alerts"           icon={ShieldAlert} color="amber"   />
        <StatCard title="AI Model Precision"   value="96.4%"              subtitle="XGBoost clinical validation" icon={BrainCircuit} color="indigo" />
      </div>

      {/* Alert Panel + Vitals Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AlertSummaryPanel alerts={alerts} onAlertResolved={fetchData} />
        </div>
        <div className="lg:col-span-2">
          {samplePatient?.vitals && samplePatient.vitals.length > 0 ? (
            <VitalsStreamChart vitals={samplePatient.vitals} />
          ) : (
            <div className="p-6 rounded-2xl glass-panel text-center text-slate-400 border border-[rgba(59,130,246,0.10)] h-full flex items-center justify-center">
              <p className="text-xs">Select a patient to view real-time WebSocket telemetry stream.</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
            Patient Triage & Telemetry Roster
          </h2>
          <span className="text-xs text-slate-400 font-mono">{patients.length} total active records</span>
        </div>
        <PatientListTable patients={patients} isLoading={isLoading} />
      </div>
    </div>
  );
};
