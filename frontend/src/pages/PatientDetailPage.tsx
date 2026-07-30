import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'reactPattern' from 'lucide-react';
import { useParams as useReactParams } from 'react-router-dom';
import { PatientService, VitalsService, getSocket } from '../services/api';
import { Patient, VitalRecord, DiagnosticReport } from '../types';
import { VitalsStreamChart } from '../components/dashboard/VitalsStreamChart';
import { RiskScoreCard } from '../components/dashboard/RiskScoreCard';
import { DiagnosticViewerModal } from '../components/dashboard/DiagnosticViewerModal';
import { TelehealthModal } from '../components/dashboard/TelehealthModal';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Heart,
  Activity,
  Thermometer,
  Gauge,
  FileText,
  Video,
  Plus,
  ArrowLeft,
  Calendar,
  Pill,
  ShieldAlert,
  User,
} from 'lucide-react';

export const PatientDetailPage: React.FC = () => {
  const { id } = useReactParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(null);
  const [showTelehealthModal, setShowTelehealthModal] = useState<boolean>(false);
  const [showManualVitalsModal, setShowManualVitalsModal] = useState<boolean>(false);

  // Manual Vitals Entry Form State
  const [manualVitals, setManualVitals] = useState({
    heartRate: '78',
    bpSystolic: '120',
    bpDiastolic: '80',
    spo2: '98',
    temperature: '36.8',
  });

  const fetchPatientDetail = async () => {
    if (!id) return;
    try {
      const data = await PatientService.getPatientById(id);
      setPatient(data);
      if (data.vitals) {
        setVitalsHistory(data.vitals);
      }
    } catch (err) {
      console.error('Error fetching patient detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetail();

    // Subscribe to real-time WebSocket vitals stream room for this patient
    const socket = getSocket();
    if (id) {
      socket.emit('subscribe_patient', id);
    }

    socket.on('vitals_update', (newVital: VitalRecord) => {
      if (newVital.patientId === id) {
        setVitalsHistory((prev) => [...prev.slice(-49), newVital]);
      }
    });

    return () => {
      if (id) {
        socket.emit('unsubscribe_patient', id);
      }
      socket.off('vitals_update');
    };
  }, [id]);

  const handleAddManualVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const record = await VitalsService.addVitalRecord(id, {
        heartRate: Number(manualVitals.heartRate),
        bpSystolic: Number(manualVitals.bpSystolic),
        bpDiastolic: Number(manualVitals.bpDiastolic),
        spo2: Number(manualVitals.spo2),
        temperature: Number(manualVitals.temperature),
      });
      setVitalsHistory((prev) => [...prev, record]);
      setShowManualVitalsModal(false);
    } catch (err) {
      console.error('Failed to log manual vitals:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Activity className="w-10 h-10 animate-spin text-clinical-teal mx-auto mb-3" />
        <p className="font-semibold text-sm">Loading patient EHR & telemetry metrics...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Patient not found.</p>
        <button
          onClick={() => navigate('/patients')}
          className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs"
        >
          Return to Roster
        </button>
      </div>
    );
  }

  const latestVital = vitalsHistory[vitalsHistory.length - 1] || patient.latestVital;

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Roster</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowManualVitalsModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Manual Vitals</span>
          </button>

          <button
            onClick={() => setShowTelehealthModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-clinical-teal to-clinical-cyan text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-glow-teal hover:opacity-90 transition-all"
          >
            <Video className="w-4 h-4" />
            <span>Launch Tele-Consultation</span>
          </button>
        </div>
      </div>

      {/* Patient EHR Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-clinical-teal to-clinical-cyan p-0.5 shadow-glow-teal">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-clinical-teal font-black text-xl">
              {patient.name.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-100">{patient.name}</h1>
              <StatusBadge level={patient.riskLevel} />
            </div>
            <p className="text-xs text-slate-400 flex items-center space-x-3">
              <span>{patient.age} yrs • {patient.gender}</span>
              <span>•</span>
              <span className="font-mono text-clinical-teal">Blood: {patient.bloodType || 'A+'}</span>
              <span>•</span>
              <span>Ward: {patient.ward} (Room {patient.roomNumber})</span>
            </p>
          </div>
        </div>

        {/* Vital Gauges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Heart Rate</p>
            <p className="text-lg font-bold text-rose-400 flex items-center justify-center space-x-1">
              <Heart className="w-4 h-4 animate-bounce" />
              <span>{latestVital ? `${latestVital.heartRate} bpm` : '--'}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">SpO2 Oxygen</p>
            <p className="text-lg font-bold text-clinical-teal flex items-center justify-center space-x-1">
              <Activity className="w-4 h-4" />
              <span>{latestVital ? `${latestVital.spo2}%` : '--'}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Blood Pressure</p>
            <p className="text-lg font-bold text-amber-400 font-mono flex items-center justify-center space-x-1">
              <Gauge className="w-4 h-4" />
              <span>{latestVital ? `${latestVital.bpSystolic}/${latestVital.bpDiastolic}` : '--'}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Temperature</p>
            <p className="text-lg font-bold text-cyan-400 flex items-center justify-center space-x-1">
              <Thermometer className="w-4 h-4" />
              <span>{latestVital ? `${latestVital.temperature}°C` : '--'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Charts & AI Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VitalsStreamChart vitals={vitalsHistory} />
        </div>

        <div className="lg:col-span-1">
          <RiskScoreCard
            score={patient.riskScore}
            level={patient.riskLevel}
            topFactors={patient.topFactors || []}
          />
        </div>
      </div>

      {/* Reports & Medical History Tabs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Test Reports Column */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-clinical-teal" />
              <span>Diagnostic Test Reports ({patient.reports?.length || 0})</span>
            </h3>
          </div>

          {patient.reports && patient.reports.length > 0 ? (
            <div className="space-y-3">
              {patient.reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-all flex items-start justify-between group"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200 group-hover:text-clinical-teal transition-colors">
                      {report.title}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{report.summary}</p>
                    <p className="text-[10px] text-slate-500">Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-clinical-teal/10 text-clinical-teal border border-clinical-teal/30 rounded">
                    {report.fileType}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-4 text-center">No diagnostic reports uploaded.</p>
          )}
        </div>

        {/* Medical History & Current Medications Column */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Pill className="w-4 h-4 text-clinical-teal" />
            <span>Clinical History & Active Medications</span>
          </h3>

          {patient.medicalHistories && patient.medicalHistories.length > 0 ? (
            <div className="space-y-4">
              {patient.medicalHistories.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-200">{item.condition}</p>
                    <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.diagnosedDate).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {item.medications && item.medications.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.medications.map((med, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700"
                        >
                          💊 {med}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-4 text-center">No medical history records logged.</p>
          )}
        </div>
      </div>

      {/* Report Viewer Modal */}
      <DiagnosticViewerModal report={selectedReport} onClose={() => setSelectedReport(null)} />

      {/* Telehealth Call Modal */}
      {showTelehealthModal && (
        <TelehealthModal patient={patient} onClose={() => setShowTelehealthModal(false)} />
      )}

      {/* Manual Vitals Form Modal */}
      {showManualVitalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Log Manual Vitals Record</h3>

            <form onSubmit={handleAddManualVitals} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Heart Rate (bpm)</label>
                <input
                  type="number"
                  required
                  value={manualVitals.heartRate}
                  onChange={(e) => setManualVitals({ ...manualVitals, heartRate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={manualVitals.bpSystolic}
                    onChange={(e) => setManualVitals({ ...manualVitals, bpSystolic: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={manualVitals.bpDiastolic}
                    onChange={(e) => setManualVitals({ ...manualVitals, bpDiastolic: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={manualVitals.spo2}
                    onChange={(e) => setManualVitals({ ...manualVitals, spo2: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={manualVitals.temperature}
                    onChange={(e) => setManualVitals({ ...manualVitals, temperature: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualVitalsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-clinical-teal hover:bg-teal-600 text-slate-950 text-xs font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
