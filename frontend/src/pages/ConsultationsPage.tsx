import React, { useState, useEffect } from 'react';
import { ConsultationService, PatientService } from '../services/api';
import { Consultation, Patient } from '../types';
import { TelehealthModal } from '../components/dashboard/TelehealthModal';
import { Video, Clock, Plus, Calendar } from 'lucide-react';

const statusColor: Record<string, string> = {
  SCHEDULED: 'text-vs-cyan bg-vs-cyan/10 border-vs-cyan/25',
  COMPLETED: 'text-vs-dim bg-[#0F1835] border-[#1A2744]',
};

export const ConsultationsPage: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    ConsultationService.getConsultations().then(setConsultations);
    PatientService.getAllPatients({}).then(p => { setPatients(p); if (p[0]) setSelectedPatient(p[0].id); });
  }, []);

  const schedule = async (e: React.FormEvent) => {
    e.preventDefault();
    await ConsultationService.scheduleConsultation({ patientId: selectedPatient, scheduledAt: new Date(scheduledAt).toISOString(), notes });
    setShowModal(false); setNotes(''); ConsultationService.getConsultations().then(setConsultations);
  };

  const launchCall = (c: Consultation) => {
    const p = patients.find(pt => pt.id === c.patientId);
    if (p) setActivePatient(p);
  };

  const inp = "w-full p-2.5 bg-[#0F1835] border border-[#1A2744] rounded-lg text-xs text-vs-text focus:outline-none focus:border-vs-cyan/50 transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Telehealth & Consultations</h1>
          <p className="text-xs text-vs-dim mt-0.5">Schedule and launch virtual clinical sessions</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-vs-cyan to-vs-purple text-white text-xs font-bold flex items-center gap-2 shadow-cyan hover:opacity-90 transition-opacity">
          <Plus size={13} /> Schedule Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultations.map(c => (
          <div key={c.id} className="vs-card vs-card-hover p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vs-cyan/25 to-vs-purple/25 border-2 border-vs-cyan/35 flex items-center justify-center text-vs-cyan font-bold text-xs">
                  {c.patient?.name?.slice(0,2).toUpperCase() ?? 'PT'}
                </div>
                <div>
                  <p className="text-xs font-bold text-vs-text">{c.patient?.name ?? 'Patient'}</p>
                  <p className="text-[10px] text-vs-dim">Room {c.patient?.roomNumber ?? 'ICU'}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor[c.status] ?? statusColor.SCHEDULED}`}>
                {c.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0F1835] border border-[#1A2744] space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-vs-dim">
                <Clock size={11} className="text-vs-cyan" />
                <span>{new Date(c.scheduledAt).toLocaleString()}</span>
              </div>
              {c.notes && <p className="text-vs-text leading-tight">{c.notes}</p>}
            </div>

            <button onClick={() => launchCall(c)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                c.status === 'COMPLETED'
                  ? 'bg-[#0F1835] border border-[#1A2744] text-vs-dim hover:border-vs-cyan/30 hover:text-vs-cyan'
                  : 'bg-gradient-to-r from-vs-cyan to-vs-purple text-white shadow-cyan hover:opacity-90'
              }`}>
              <Video size={13} />
              {c.status === 'COMPLETED' ? 'Re-open Session' : 'Launch Video Call'}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0B1329] border border-[#1A2744] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-vs-cyan" />
              <h3 className="text-sm font-bold text-white">Schedule Tele-Session</h3>
            </div>
            <form onSubmit={schedule} className="space-y-3">
              <div>
                <label className="text-[10px] text-vs-dim uppercase font-semibold">Patient</label>
                <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className={inp}>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} (Rm {p.roomNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-vs-dim uppercase font-semibold">Date & Time</label>
                <input type="datetime-local" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-[10px] text-vs-dim uppercase font-semibold">Notes / Agenda</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`${inp} h-16 resize-none`} placeholder="Cardiology follow-up..." />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg bg-[#0F1835] border border-[#1A2744] text-xs text-vs-dim hover:text-vs-text transition-colors">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-vs-cyan to-vs-purple text-white text-xs font-bold hover:opacity-90 transition-opacity">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activePatient && <TelehealthModal patient={activePatient} onClose={() => setActivePatient(null)} />}
    </div>
  );
};
