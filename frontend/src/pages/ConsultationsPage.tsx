import React, { useState, useEffect } from 'react';
import { ConsultationService, PatientService } from '../services/api';
import { Consultation, Patient } from '../types';
import { TelehealthModal } from '../components/dashboard/TelehealthModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Video, Clock, Plus } from 'lucide-react';

export const ConsultationsPage: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCallPatient, setActiveCallPatient] = useState<Patient | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const fetchConsultations = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        ConsultationService.getConsultations(),
        PatientService.getAllPatients(),
      ]);
      setConsultations(cRes);
      setPatients(pRes);
      if (pRes.length > 0) setSelectedPatientId(pRes[0].id);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchConsultations(); }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ConsultationService.scheduleConsultation({
        patientId: selectedPatientId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes,
      });
      setShowScheduleModal(false);
      setNotes('');
      fetchConsultations();
    } catch (err) {
      console.error('Failed to schedule consultation:', err);
    }
  };

  const launchCall = (consultation: Consultation) => {
    const p = patients.find((pat) => pat.id === consultation.patientId);
    if (p) setActiveCallPatient(p);
  };

  const inputCls = "w-full p-2.5 rounded-xl bg-[rgba(15,23,42,0.80)] border border-[rgba(59,130,246,0.15)] text-xs text-slate-100 focus:outline-none focus:border-blue-500/50 transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-wide">Telehealth & Virtual Consultations</h1>
          <p className="text-xs text-slate-400">Schedule tele-rounding appointments and launch HD clinical video calls</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center space-x-2 shadow-glow-blue hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Tele-Rounding</span>
        </button>
      </div>

      {/* Consultation cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultations.map((c) => {
          const isCompleted = c.status === 'COMPLETED';
          return (
            <div key={c.id} className="p-5 rounded-2xl glass-panel glass-panel-hover border border-[rgba(59,130,246,0.12)] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {/* Circular patient avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-500/15 border-2 border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center">
                      {c.patient?.name?.slice(0, 2).toUpperCase() || 'PT'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{c.patient?.name || 'Patient'}</p>
                      <p className="text-[10px] text-slate-400">Room {c.patient?.roomNumber || 'ICU'}</p>
                    </div>
                  </div>
                  <StatusBadge level={c.status as any} />
                </div>

                <div className="p-3 rounded-xl bg-[rgba(15,23,42,0.55)] border border-[rgba(59,130,246,0.08)] space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Scheduled: {new Date(c.scheduledAt).toLocaleString()}</span>
                  </div>
                  {c.notes && (
                    <div className="pt-1 text-[11px] text-slate-300">
                      <span className="font-semibold text-slate-400">Notes: </span>{c.notes}
                    </div>
                  )}
                  {c.prescription && (
                    <div className="pt-1 text-[11px] text-emerald-400 font-mono">
                      <span className="font-semibold text-slate-400 font-sans">Rx: </span>{c.prescription}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => launchCall(c)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  isCompleted
                    ? 'bg-[rgba(30,41,59,0.80)] text-slate-300 hover:bg-slate-700 border border-slate-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-glow-blue hover:from-blue-500 hover:to-indigo-500'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>{isCompleted ? 'Re-open Video Session' : 'Launch Tele-Call Now'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Schedule Consultation Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F172A] border border-[rgba(59,130,246,0.20)] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Schedule Tele-Rounding Session</h3>
            <form onSubmit={handleSchedule} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Patient</label>
                <select value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className={inputCls}>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Room {p.roomNumber || 'ICU'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Date & Time</label>
                <input type="datetime-local" required value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Clinical Purpose / Agenda</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Routine cardiac rounding, hypoxemia follow-up..."
                  className={`${inputCls} h-20 resize-none`} />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-[rgba(30,41,59,0.80)] text-slate-300 text-xs font-semibold hover:bg-slate-700 border border-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-glow-blue hover:from-blue-500 hover:to-indigo-500 transition-all">
                  Schedule Tele-Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeCallPatient && (
        <TelehealthModal patient={activeCallPatient} onClose={() => setActiveCallPatient(null)} />
      )}
    </div>
  );
};
