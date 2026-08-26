import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientService, VitalsService, getSocket } from '../services/api';
import { Patient, VitalRecord } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Heart, Droplets, Wind, ChevronRight, Video, Calendar, Clock, MapPin, Plus, Check } from 'lucide-react';

// Sparkline
const Spark: React.FC<{ data: number[]; color: string; h?: number }> = ({ data, color, h = 32 }) => (
  <div style={{ width: 90, height: h }} className="sparkline">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.map((v, i) => ({ v, i }))}>
        <defs>
          <linearGradient id={`spk-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#spk-${color.replace('#','')})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Donut gauge
const Gauge: React.FC<{ pct: number; color: string; size?: number }> = ({ pct, color, size = 100 }) => {
  const r = (size - 14) / 2, c = size / 2, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#1A2744" strokeWidth={10} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-black text-white">{pct}</p>
        <p className="text-[9px] text-vs-dim">Excellent</p>
      </div>
    </div>
  );
};

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [manVitals, setManVitals] = useState({ heartRate:'78', bpSystolic:'120', bpDiastolic:'80', spo2:'97', temperature:'36.8' });

  useEffect(() => {
    if (!id) return;
    PatientService.getPatientById(id).then(p => { setPatient(p); setVitals(p.vitals ?? []); setLoading(false); });
    const socket = getSocket();
    socket.emit('subscribe_patient', id);
    socket.on('vitals_update', (v: VitalRecord) => { if (v.patientId === id) setVitals(p => [...p.slice(-49), v]); });
    return () => { socket.emit('unsubscribe_patient', id); socket.off('vitals_update'); };
  }, [id]);

  const addVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const rec = await VitalsService.addVitalRecord(id, { heartRate: +manVitals.heartRate, bpSystolic: +manVitals.bpSystolic, bpDiastolic: +manVitals.bpDiastolic, spo2: +manVitals.spo2, temperature: +manVitals.temperature });
    setVitals(p => [...p, rec]);
    setShowModal(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-vs-dim">
      <div className="w-8 h-8 border-2 border-vs-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!patient) return <div className="text-vs-dim p-8">Patient not found.</div>;

  const lv = vitals[vitals.length - 1] ?? patient.latestVital;
  const hrData  = vitals.slice(-12).map(v => v.heartRate);
  const bpData  = vitals.slice(-12).map(v => v.bpSystolic);
  const spo2Data = vitals.slice(-12).map(v => v.spo2);

  const wellness = Math.max(0, 100 - (patient.riskScore ?? 30));
  const wellnessItems = [
    { label: 'Activity',      val: 90, icon: '⚡', color: '#00D4FF' },
    { label: 'Sleep',         val: 82, icon: '🌙', color: '#8B5CF6' },
    { label: 'Nutrition',     val: 85, icon: '🥗', color: '#F97316' },
    { label: 'Mental Health', val: 88, icon: '💜', color: '#10B981' },
  ];

  const careJourney = [
    { label: 'Diagnosis',      date: 'May 10, 2025', done: true },
    { label: 'Treatment Plan', date: 'May 12, 2025', done: true },
    { label: 'Recovery',       date: 'In Progress',  active: true },
    { label: 'Follow-up',      date: 'Jun 10, 2025', done: false },
    { label: 'Maintenance',    date: 'Ongoing',       done: false },
  ];

  const inp = "w-full p-2 bg-[#0F1835] border border-[#1A2744] rounded-lg text-xs text-vs-text focus:outline-none focus:border-vs-cyan/50 transition-colors";

  return (
    <div className="flex flex-col gap-4">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-xs text-vs-dim hover:text-vs-cyan transition-colors">
          <ArrowLeft size={14} /> Back to Patients
        </button>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)} className="px-3 py-1.5 rounded-lg bg-[#0B1329] border border-[#1A2744] text-xs text-vs-text hover:border-vs-cyan/30 flex items-center gap-1.5 transition-colors">
            <Plus size={12} /> Log Vitals
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-vs-cyan to-vs-purple text-white text-xs font-semibold flex items-center gap-1.5 shadow-cyan hover:opacity-90 transition-opacity">
            <Video size={12} /> Launch Tele-Consultation
          </button>
        </div>
      </div>

      {/* Main 3-col */}
      <div className="flex gap-4">
        {/* LEFT */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4">
          {/* Patient Card */}
          <div className="vs-card p-5 flex flex-col gap-3">
            <p className="text-[10px] font-semibold text-vs-dim uppercase tracking-widest">Patient</p>
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-vs-cyan/30 to-vs-purple/30 border-2 border-vs-cyan/40 flex items-center justify-center text-vs-cyan text-lg font-bold flex-shrink-0">
                {patient.name.slice(0,2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">{patient.name}</h2>
                <p className="text-xs text-vs-dim mt-0.5">{patient.age} yrs · {patient.gender}</p>
                <p className="text-[11px] text-vs-dim font-mono mt-0.5">MRN {patient.id.slice(0,8).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="live-dot w-2 h-2" style={{ width: 7, height: 7, background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
              <span className="text-xs font-semibold text-vs-green">Stable</span>
            </div>
            <button className="w-full py-2 rounded-lg bg-[#0F1835] border border-[#1A2744] text-xs text-vs-text flex items-center justify-center gap-2 hover:border-vs-cyan/30 transition-colors">
              Open Profile <ChevronRight size={12} />
            </button>
          </div>

          {/* Key Vitals */}
          <div className="vs-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-vs-text">Key Vitals</p>
              <div className="flex items-center gap-1.5">
                <div className="live-dot w-2 h-2" style={{ width: 6, height: 6 }} />
                <span className="text-[10px] text-vs-green font-semibold">Live</span>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-vs-rose/15 border border-vs-rose/30 flex items-center justify-center">
                  <Heart size={16} className="text-vs-rose" />
                </div>
                <div>
                  <p className="text-[10px] text-vs-dim">Heart Rate</p>
                  <p className="text-base font-bold text-white">{lv?.heartRate ?? '--'} <span className="text-xs font-normal text-vs-dim">bpm</span></p>
                </div>
              </div>
              <Spark data={hrData.length ? hrData : [70,72,75,71,73,72,74,72]} color="#F43F5E" />
            </div>

            {/* Blood Pressure */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-vs-purple/15 border border-vs-purple/30 flex items-center justify-center">
                  <Droplets size={16} className="text-vs-purple" />
                </div>
                <div>
                  <p className="text-[10px] text-vs-dim">Blood Pressure</p>
                  <p className="text-base font-bold text-white">{lv ? `${lv.bpSystolic}/${lv.bpDiastolic}` : '--'} <span className="text-xs font-normal text-vs-dim">mmHg</span></p>
                </div>
              </div>
              <Spark data={bpData.length ? bpData : [118,122,120,124,121,119,123,124]} color="#8B5CF6" />
            </div>

            {/* SpO2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-vs-cyan/15 border border-vs-cyan/30 flex items-center justify-center">
                  <Wind size={16} className="text-vs-cyan" />
                </div>
                <div>
                  <p className="text-[10px] text-vs-dim">Oxygen Saturation</p>
                  <p className="text-base font-bold text-white">{lv?.spo2 ?? '--'}%</p>
                </div>
              </div>
              <Spark data={spo2Data.length ? spo2Data : [96,97,97,98,97,96,97,97]} color="#00D4FF" />
            </div>
          </div>
        </div>

        {/* CENTER: Body Visualization */}
        <div className="flex-1 vs-card flex items-center justify-center relative overflow-hidden bg-[#040812] min-h-0" style={{ minHeight: 380 }}>
          {/* Background rings */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
            {[160, 130, 100].map((w, i) => (
              <div key={i} className="rounded-full border border-vs-cyan/10" style={{ width: w, height: w / 3, position: 'absolute', bottom: i * 8 }} />
            ))}
          </div>
          {/* Ambient glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-vs-cyan/4 blur-3xl" />
          </div>
          {/* Body SVG */}
          <svg viewBox="0 0 160 320" className="body-glow relative z-10" style={{ height: 300, maxWidth: '100%' }}>
            {/* Head */}
            <ellipse cx="80" cy="28" rx="22" ry="26" fill="rgba(0,212,255,0.06)" stroke="rgba(0,212,255,0.45)" strokeWidth="1.2" />
            {/* Neck */}
            <rect x="72" y="52" width="16" height="18" rx="4" fill="rgba(0,212,255,0.05)" stroke="rgba(0,212,255,0.3)" strokeWidth="1" />
            {/* Torso */}
            <path d="M52 70 L30 130 L32 200 L128 200 L130 130 L108 70 Z"
              fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.4)" strokeWidth="1.2" />
            {/* Left arm */}
            <path d="M52 75 L24 140 L20 180" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="8" strokeLinecap="round" />
            {/* Right arm */}
            <path d="M108 75 L136 140 L140 180" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="8" strokeLinecap="round" />
            {/* Left leg */}
            <path d="M65 200 L58 270 L55 310" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="10" strokeLinecap="round" />
            {/* Right leg */}
            <path d="M95 200 L102 270 L105 310" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="10" strokeLinecap="round" />
            {/* Ribs */}
            {[95,110,125,140].map((y, i) => (
              <g key={i}>
                <path d={`M76 ${y} C60 ${y-4}, 44 ${y+3}, 38 ${y+8}`} fill="none" stroke="rgba(0,212,255,0.18)" strokeWidth="0.8" />
                <path d={`M84 ${y} C100 ${y-4}, 116 ${y+3}, 122 ${y+8}`} fill="none" stroke="rgba(0,212,255,0.18)" strokeWidth="0.8" />
              </g>
            ))}
            {/* Heart glow */}
            <ellipse cx="78" cy="118" rx="14" ry="16" fill="rgba(255,80,50,0.20)" className="organ-glow-heart" />
            <ellipse cx="78" cy="118" rx="8" ry="10" fill="rgba(255,80,50,0.55)" className="organ-glow-heart" />
            {/* Lungs */}
            <path d="M62 95 C50 100, 44 115, 46 135 C48 150, 56 158, 66 155 L68 100 Z"
              fill="rgba(0,212,255,0.07)" stroke="rgba(0,212,255,0.3)" strokeWidth="0.8" />
            <path d="M98 95 C110 100, 116 115, 114 135 C112 150, 104 158, 94 155 L92 100 Z"
              fill="rgba(0,212,255,0.07)" stroke="rgba(0,212,255,0.3)" strokeWidth="0.8" />
          </svg>
          {/* Base circle glow */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-5 rounded-full bg-vs-cyan/20 blur-lg" />
        </div>

        {/* RIGHT */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-3">
          {/* Wellness Score */}
          <div className="vs-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-vs-text">Wellness Score</p>
              <span className="text-[10px] text-vs-dim cursor-help">ⓘ</span>
            </div>
            <div className="flex items-center gap-3">
              <Gauge pct={wellness > 0 ? wellness : 86} color="#00D4FF" size={90} />
              <div className="space-y-1.5 flex-1">
                {wellnessItems.map(w => (
                  <div key={w.label} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{w.icon}</span>
                      <span className="text-vs-dim">{w.label}</span>
                    </div>
                    <span className="font-bold" style={{ color: w.color }}>{w.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-vs-green flex items-center gap-1">↑ 12% improvement vs last month</p>
          </div>

          {/* Upcoming Appointment */}
          <div className="vs-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-vs-cyan" />
              <p className="text-xs font-semibold text-vs-text">Upcoming Appointment</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-[#0F1835] border border-[#1A2744] rounded-xl p-2.5 text-center flex-shrink-0">
                <p className="text-[9px] text-vs-cyan font-bold uppercase tracking-wider">MAY</p>
                <p className="text-2xl font-black text-white leading-none">26</p>
                <p className="text-[9px] text-vs-dim">2025</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cardiology Consultation</p>
                <p className="text-[10px] text-vs-dim flex items-center gap-1 mt-1"><Clock size={9} />09:30 AM</p>
                <p className="text-[10px] text-vs-dim flex items-center gap-1 mt-0.5"><MapPin size={9} />Room 12A</p>
              </div>
            </div>
            <button className="w-full py-2 rounded-lg bg-[#0F1835] border border-[#1A2744] text-xs text-vs-text flex items-center justify-center gap-2 hover:border-vs-cyan/30 transition-colors">
              View Appointment <ChevronRight size={12} />
            </button>
          </div>

          {/* Medications */}
          <div className="vs-card p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-vs-text">Medications</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-vs-cyan/10 text-vs-cyan border border-vs-cyan/20">
                {patient.medicalHistories?.length ?? 2} Active
              </span>
            </div>
            <div className="space-y-2">
              {(patient.medicalHistories?.flatMap(h => h.medications ?? []).slice(0,3) ?? ['Aspirin 81mg','Metoprolol 25mg']).map((med, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1835] border border-[#1A2744]">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: i % 2 === 0 ? 'rgba(0,212,255,0.15)' : 'rgba(139,92,246,0.15)' }}>
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-vs-text truncate">{med}</p>
                    <p className="text-[10px] text-vs-dim">{i % 2 === 0 ? 'Once daily' : 'Twice daily'}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-vs-green" title="Active" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Care Journey */}
      <div className="vs-card p-5">
        <p className="text-xs font-semibold text-vs-text mb-4">Care Journey</p>
        <div className="flex items-start gap-2">
          {careJourney.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ minWidth: 80 }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.active ? 'border-vs-cyan bg-vs-cyan/15 shadow-cyan' :
                  step.done   ? 'border-vs-green bg-vs-green/15' :
                                'border-[#1A2744] bg-[#0F1835]'
                }`}>
                  {step.done && !step.active
                    ? <Check size={16} className="text-vs-green" />
                    : step.active
                      ? <Heart size={16} className="text-vs-cyan" />
                      : <div className="w-4 h-4 rounded-full border border-[#1A2744]" />
                  }
                </div>
                <p className="text-[11px] font-semibold text-center" style={{ color: step.active ? '#00D4FF' : step.done ? '#10B981' : '#64748B' }}>
                  {step.label}
                </p>
                <p className="text-[10px] text-vs-dim text-center leading-tight">{step.date}</p>
                {step.active && <p className="text-[9px] text-vs-cyan font-bold">In Progress</p>}
              </div>
              {i < careJourney.length - 1 && (
                <div className="flex-1 h-0.5 mt-5 rounded-full" style={{ background: step.done ? '#10B981' : '#1A2744' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Manual Vitals Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0B1329] border border-[#1A2744] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Log Manual Vitals</h3>
            <form onSubmit={addVitals} className="space-y-3">
              {[
                ['Heart Rate (bpm)', 'heartRate'],
                ['SpO2 (%)',         'spo2'],
                ['Temperature (°C)','temperature'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="text-[10px] text-vs-dim font-semibold uppercase">{label}</label>
                  <input type="number" step="0.1" value={(manVitals as any)[key]}
                    onChange={e => setManVitals(p => ({ ...p, [key]: e.target.value }))}
                    className={inp} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-vs-dim font-semibold uppercase">Systolic</label>
                  <input type="number" value={manVitals.bpSystolic}
                    onChange={e => setManVitals(p => ({ ...p, bpSystolic: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] text-vs-dim font-semibold uppercase">Diastolic</label>
                  <input type="number" value={manVitals.bpDiastolic}
                    onChange={e => setManVitals(p => ({ ...p, bpDiastolic: e.target.value }))} className={inp} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg bg-[#0F1835] border border-[#1A2744] text-xs text-vs-dim hover:text-vs-text transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-vs-cyan to-vs-purple text-white text-xs font-bold shadow-cyan hover:opacity-90 transition-opacity">
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
