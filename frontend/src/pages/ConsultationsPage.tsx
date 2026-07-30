import React, { useState, useEffect } from 'react';
import { ConsultationService, PatientService } from '../services/api';
import { Consultation, Patient } from '../types';
import { TelehealthModal } from '../components/dashboard/TelehealthModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Video, Calendar, User, Clock, FileText, Plus } from 'lucide-react';

export const ConsultationsPage: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCallPatient, setActiveCallPatient] = useState<Patient | null>(null);

  // New Consultation Modal State
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

  useEffect(() => {
    fetchConsultations();
  }, []);

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
    if (p) {
      setActiveCallPatient(p);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-wide">
            Telehealth & Virtual Consultations
          </h1>
          <p className="text-xs text-slate-400">
            Schedule tele-rounding appointments and launch HD clinical video calls
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-clinical-teal to-clinical-cyan text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-glow-teal hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Tele-Rounding</span>
        </button>
      </div>

      {/* Consultations List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultations.map((c) => {
          const isCompleted = c.status === 'COMPLETED';
          return (
            <div
              key={c.id}
              className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-clinical-teal/10 border border-clinical-teal/30 text-clinical-teal font-bold text-xs flex items-center justify-center">
                      {c.patient?.name?.slice(0, 2).toUpperCase() || 'PT'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{c.patient?.name || 'Patient'}</p>
                      <p className="text-[10px] text-slate-400">Room {c.patient?.roomNumber || 'ICU'}</p>
                    </div>
                  </div>
                  <StatusBadge level={c.status as any} />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-clinical-teal" />
                    <span>Scheduled: {new Date(c.scheduledAt).toLocaleString()}</span>
                  </div>

                  {c.notes && (
                    <div className="pt-1 text-[11px] text-slate-300">
                      <span className="font-semibold text-slate-400">Notes: </span>
                      {c.notes}
                    </div>
                  )}

                  {c.prescription && (
                    <div className="pt-1 text-[11px] text-emerald-400 font-mono">
                      <span className="font-semibold text-slate-400 font-sans">Rx: </span>
                      {c.prescription}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => launchCall(c)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  isCompleted
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-clinical-teal hover:bg-teal-600 text-slate-950 shadow-glow-teal'
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
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Schedule Tele-Rounding Session</h3>

            <form onSubmit={handleSchedule} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Room {p.roomNumber || 'ICU'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Clinical Purpose / Agenda</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Routine cardiac rounding, hypoxemia follow-up..."
                  className="w-full h-20 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-clinical-teal hover:bg-teal-600 text-slate-950 text-xs font-bold"
                >
                  Schedule Tele-Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Call Telehealth Modal */}
      {activeCallPatient && (
        <TelehealthModal patient={activeCallPatient} onClose={() => setActiveCallPatient(null)} />
      )}
    </div>
  );
};
