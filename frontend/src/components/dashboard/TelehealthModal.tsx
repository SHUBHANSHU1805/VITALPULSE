import React, { useState } from 'react';
import { Patient, Consultation } from '../../types';
import { Video, Mic, MicOff, VideoOff, PhoneOff, FileText, Send, CheckCircle2, User } from 'lucide-react';
import { ConsultationService } from '../../services/api';

interface TelehealthModalProps {
  patient: Patient;
  consultation?: Consultation | null;
  onClose: () => void;
}

export const TelehealthModal: React.FC<TelehealthModalProps> = ({ patient, consultation, onClose }) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [notes, setNotes] = useState(consultation?.notes || '');
  const [prescription, setPrescription] = useState(consultation?.prescription || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConsultation = async () => {
    setIsSaving(true);
    try {
      if (consultation) {
        await ConsultationService.updateConsultation(consultation.id, {
          notes,
          prescription,
          status: 'COMPLETED',
        });
      } else {
        await ConsultationService.scheduleConsultation({
          patientId: patient.id,
          scheduledAt: new Date().toISOString(),
          notes,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save consultation:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-5xl bg-[#0F172A] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[550px]">
        {/* Left 2 Columns: Video Consultation Feed */}
        <div className="lg:col-span-2 bg-slate-950 p-6 flex flex-col justify-between relative border-r border-slate-800">
          {/* Top Bar Overlay */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold text-slate-200">Encrypted HD Tele-Session</span>
              <span className="text-slate-500 font-mono">00:04:12</span>
            </div>

            <span className="text-xs font-semibold text-clinical-teal bg-clinical-teal/10 px-2.5 py-1 rounded-lg border border-clinical-teal/30">
              Room {patient.roomNumber || 'ICU'}
            </span>
          </div>

          {/* Main Video View Container */}
          <div className="my-auto relative flex items-center justify-center h-80 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 overflow-hidden">
            {!isVideoOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-slate-900/50">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-clinical-teal to-clinical-cyan p-1 shadow-glow-teal">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-clinical-teal font-extrabold text-2xl">
                    {patient.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-100">{patient.name}</p>
                  <p className="text-xs text-slate-400">Live Video Stream Connected • 1080p</p>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs font-semibold flex items-center space-x-2">
                <VideoOff className="w-6 h-6" />
                <span>Patient Video Muted</span>
              </div>
            )}

            {/* Doctor PIP preview in bottom corner */}
            <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl bg-slate-900 border border-slate-700 shadow-xl flex items-center justify-center text-xs text-slate-400 font-semibold">
              <User className="w-6 h-6 text-clinical-teal mb-1" />
            </div>
          </div>

          {/* Call Controls Bar */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-3 rounded-2xl border transition-all ${
                isAudioMuted ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-2xl border transition-all ${
                isVideoOff ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-rose transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Right 1 Column: Clinical Notes & Digital Prescription Panel */}
        <div className="p-6 bg-[#0F172A] flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-clinical-teal" />
              <span>Consultation Notes & Rx</span>
            </h4>

            {/* Clinical Observations Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Clinician Observations</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record patient complaints, physical findings, telemetry review..."
                className="w-full h-24 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-clinical-teal resize-none"
              />
            </div>

            {/* Prescription Writer */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Digital Prescription (Rx)</label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="e.g., Titrate Oxygen 2L/min, Furosemide 20mg IV daily..."
                className="w-full h-24 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-clinical-teal resize-none font-mono"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {savedSuccess && (
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs text-center font-semibold flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Consultation saved to patient EHR!</span>
              </div>
            )}

            <button
              onClick={handleSaveConsultation}
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-clinical-teal hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSaving ? 'Saving EHR Record...' : 'Save & Update Patient EHR'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
