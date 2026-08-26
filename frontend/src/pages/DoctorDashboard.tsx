import React, { useState, useEffect } from 'react';
import { PatientService, AlertService, ConsultationService } from '../services/api';
import { Patient, Alert, Consultation } from '../types';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MoreHorizontal, TrendingUp, TrendingDown, Users, AlertTriangle, Calendar, Plus, ChevronRight, Brain } from 'lucide-react';

// ─── Tiny Sparkline ──────────────────────────────────────────────────────────
const Spark: React.FC<{ data: number[]; color: string }> = ({ data, color }) => (
  <ResponsiveContainer width={80} height={28}>
    <AreaChart data={data.map((v, i) => ({ v, i }))}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${color})`} dot={false} isAnimationActive={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Donut Arc SVG ────────────────────────────────────────────────────────────
const DonutArc: React.FC<{ pct: number; size?: number; color: string; label: string; sub?: string }> = ({ pct, size = 80, color, label, sub }) => {
  const r = (size - 12) / 2, c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#1A2744" strokeWidth={8} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-sm font-bold text-white leading-none">{pct}%</p>
        {sub && <p className="text-[9px] text-vs-dim mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPI: React.FC<{ icon: React.ReactNode; iconBg: string; label: string; value: string | number; trend: string; up: boolean }> = ({ icon, iconBg, label, value, trend, up }) => (
  <div className="vs-card p-4 flex items-start justify-between">
    <div>
      <p className="text-xs text-vs-dim">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className={`text-[11px] mt-1 flex items-center gap-1 ${up ? 'text-vs-green' : 'text-vs-rose'}`}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {trend}
      </p>
    </div>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
  </div>
);

export const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    PatientService.getAllPatients({}).then(setPatients).catch(console.error);
    AlertService.getAlerts({ resolved: false }).then(setAlerts).catch(console.error);
    ConsultationService.getConsultations().then(setConsultations).catch(console.error);
  }, []);

  const sample = patients[0];
  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalCount = patients.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length;

  // Revenue sparkline
  const revData = [0.8, 1.0, 0.9, 1.1, 1.2, 1.1, 1.3, 1.48];

  // Staffing pie
  const staff = [
    { name: 'Physicians', value: 26, color: '#3B82F6' },
    { name: 'Nurses',     value: 46, color: '#8B5CF6' },
    { name: 'Technicians',value: 14, color: '#F97316' },
    { name: 'Support',    value: 14, color: '#10B981' },
  ];

  // Schedule times mock based on consultations
  const schedItems = consultations.slice(0, 4).map((c, i) => ({
    time: ['09:30 AM','10:45 AM','01:15 PM','03:30 PM'][i] ?? '--:--',
    type: ['Consultation','Follow-up','Procedure','Review'][i] ?? 'Consultation',
    room: c.patient?.roomNumber ?? 'ICU',
    initials: c.patient?.name?.slice(0,2).toUpperCase() ?? 'PT',
    color: ['#00D4FF','#10B981','#8B5CF6','#F97316'][i] ?? '#00D4FF',
  }));

  // AI insights from alerts
  const insights = [
    { icon: '🧠', title: 'High risk of readmission', desc: 'Similar cases show 28% readmission rate.', color: 'text-vs-rose' },
    { icon: '💊', title: 'Medication adjustment', desc: 'Consider dosage review for beta blockers.', color: 'text-vs-amber' },
    { icon: '⚠️', title: 'Sepsis risk elevated', desc: 'Monitor vitals and labs closely.', color: 'text-vs-orange' },
  ];

  // Care pathway steps
  const pathway = [
    { label: 'Referral',     day: 'Day 0',   done: true },
    { label: 'Consult',      day: 'Day 1',   done: true },
    { label: 'Diagnostics',  day: 'Day 2-3', done: true },
    { label: 'Procedure',    day: 'Day 4',   active: true },
    { label: 'Recovery',     day: 'Day 5-7', done: false },
    { label: 'Follow-up',    day: 'Day 30',  done: false },
  ];

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* ── LEFT PANEL ───────────────────────────────── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-4">
        {/* Patient Overview */}
        <div className="vs-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-vs-dim uppercase tracking-wider">Patient Overview</p>
            <MoreHorizontal size={14} className="text-vs-dim" />
          </div>
          {sample ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-vs-cyan/30 to-vs-purple/30 border-2 border-vs-cyan/40 flex items-center justify-center text-vs-cyan text-lg font-bold">
                  {sample.name.slice(0,2).toUpperCase()}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{sample.name}</p>
                  <p className="text-[10px] text-vs-dim">MRN #{sample.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px]">
                {[
                  ['Age', `${sample.age} · ${sample.gender}`],
                  ['Blood Type', sample.bloodType ?? 'O+'],
                  ['Location', `Ward ${sample.ward}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-vs-dim">{k}</span>
                    <span className="text-vs-text font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-1 py-2 rounded-lg bg-[#0F1835] border border-[#1A2744] text-xs text-vs-text flex items-center justify-center gap-2 hover:border-vs-cyan/30 transition-colors">
                View Full Profile <ChevronRight size={12} />
              </button>
            </>
          ) : (
            <p className="text-xs text-vs-dim text-center py-4">Loading patient data…</p>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="vs-card p-4 flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-vs-dim uppercase tracking-wider">Today's Schedule</p>
            <button className="text-[10px] text-vs-cyan hover:underline">View all</button>
          </div>
          <div className="space-y-2.5">
            {schedItems.length > 0 ? schedItems.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-[10px] text-vs-dim w-14 flex-shrink-0">{s.time}</div>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-vs-text truncate">{s.type}</p>
                  <p className="text-[10px] text-vs-dim">Room {s.room}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-vs-cyan/20 to-vs-purple/20 flex items-center justify-center text-[9px] font-bold text-vs-cyan">
                  {s.initials}
                </div>
              </div>
            )) : (
              <p className="text-xs text-vs-dim text-center py-2">No appointments today</p>
            )}
          </div>
          <button className="w-full mt-auto py-2 rounded-lg border border-dashed border-[#1A2744] text-[11px] text-vs-dim flex items-center justify-center gap-1.5 hover:border-vs-cyan/30 hover:text-vs-cyan transition-colors">
            <Plus size={12} /> Add Appointment
          </button>
        </div>
      </div>

      {/* ── CENTER + RIGHT ────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Top row: Analysis panel + Right KPIs */}
        <div className="flex gap-4 flex-1">
          {/* Center: Main viz panel */}
          <div className="flex-1 vs-card p-5 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">Pulmonary Analysis</h2>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-vs-green/10 border border-vs-green/25">
                    <div className="live-dot w-1.5 h-1.5" style={{ width: 6, height: 6 }} />
                    <span className="text-[10px] font-semibold text-vs-green">Live</span>
                  </div>
                </div>
                <p className="text-[11px] text-vs-dim mt-0.5">3D Imaging · Real-time</p>
              </div>
            </div>

            {/* Medical visualization */}
            <div className="flex-1 relative flex items-center justify-center bg-[#040812] rounded-xl overflow-hidden min-h-0" style={{ minHeight: 220 }}>
              {/* Background glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full bg-vs-cyan/5 blur-3xl" />
              </div>
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={`${i * 14.3}%`} x2="100%" y2={`${i * 14.3}%`} stroke="#00D4FF" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`v${i}`} x1={`${i * 11.1}%`} y1="0" x2={`${i * 11.1}%`} y2="100%" stroke="#00D4FF" strokeWidth="0.5" />
                ))}
              </svg>

              {/* Lung SVG */}
              <svg viewBox="0 0 200 180" className="body-glow relative z-10" style={{ height: 180, maxWidth: '100%' }}>
                {/* Left lung */}
                <path d="M80 30 C60 30, 40 55, 40 90 C40 125, 55 155, 80 160 C90 162, 95 155, 95 145 L95 30 Z"
                  fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.5)" strokeWidth="1.2" />
                {/* Right lung */}
                <path d="M120 30 C140 30, 160 55, 160 90 C160 125, 145 155, 120 160 C110 162, 105 155, 105 145 L105 30 Z"
                  fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.5)" strokeWidth="1.2" />
                {/* Trachea */}
                <line x1="100" y1="10" x2="100" y2="35" stroke="rgba(0,212,255,0.6)" strokeWidth="3" strokeLinecap="round" />
                <line x1="100" y1="35" x2="88" y2="42" stroke="rgba(0,212,255,0.5)" strokeWidth="2" strokeLinecap="round" />
                <line x1="100" y1="35" x2="112" y2="42" stroke="rgba(0,212,255,0.5)" strokeWidth="2" strokeLinecap="round" />
                {/* Ribs */}
                {[60, 80, 100, 120].map((y, i) => (
                  <g key={i}>
                    <path d={`M95 ${y} C75 ${y - 5}, 55 ${y + 5}, 50 ${y + 10}`} fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
                    <path d={`M105 ${y} C125 ${y - 5}, 145 ${y + 5}, 150 ${y + 10}`} fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
                  </g>
                ))}
                {/* Anomaly hotspot - left lung */}
                <circle cx="65" cy="110" r="12" fill="rgba(239,68,68,0.25)" />
                <circle cx="65" cy="110" r="6" fill="rgba(239,68,68,0.6)" style={{ animation: 'pulseCrit 2s infinite' }} />
                {/* Anomaly hotspot - right lung */}
                <circle cx="140" cy="80" r="9" fill="rgba(249,115,22,0.25)" />
                <circle cx="140" cy="80" r="5" fill="rgba(249,115,22,0.6)" />
              </svg>

              {/* Floating callout cards */}
              <div className="absolute top-4 left-4 bg-[#0B1329]/90 border border-[#1A2744] rounded-xl p-3 text-left">
                <p className="text-[10px] text-vs-dim">Atelectasis</p>
                <p className="text-[10px] text-vs-dim">Probability</p>
                <p className="text-xl font-bold text-vs-rose">78%</p>
                <p className="text-[9px] text-vs-cyan mt-1">Lower Lobe · Right Lung</p>
              </div>
              <div className="absolute top-4 right-4 bg-[#0B1329]/90 border border-[#1A2744] rounded-xl p-3 text-left">
                <p className="text-[10px] text-vs-dim">Nodule Detected</p>
                <p className="text-[10px] text-vs-dim">Probability</p>
                <p className="text-xl font-bold text-vs-amber">62%</p>
                <p className="text-[9px] text-vs-cyan mt-1">Upper Lobe · Left Lung</p>
              </div>
            </div>
          </div>

          {/* Right: KPIs + Efficiency + Revenue */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-3">
            {/* KPI row */}
            <div className="grid grid-cols-1 gap-2">
              <KPI icon={<Users size={14} className="text-vs-cyan" />} iconBg="bg-vs-cyan/10"
                label="Total Patients" value={patients.length || 2846} trend="12.6% vs last week" up={true} />
              <KPI icon={<Calendar size={14} className="text-vs-purple" />} iconBg="bg-vs-purple/10"
                label="Appointments" value={consultations.length || 342} trend="8.4% vs last week" up={true} />
              <KPI icon={<AlertTriangle size={14} className="text-vs-rose" />} iconBg="bg-vs-rose/10"
                label="Critical Alerts" value={activeAlerts.length || criticalCount} trend="20% vs last week" up={false} />
            </div>

            {/* Operational Efficiency */}
            <div className="vs-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-vs-text">Operational Efficiency</p>
                <span className="text-[10px] text-vs-dim">This Week</span>
              </div>
              <div className="flex items-center gap-3">
                <DonutArc pct={87} size={72} color="#00D4FF" label="87%" sub="Excellent" />
                <div className="space-y-1.5 text-[11px] flex-1">
                  {[['Patient Throughput','#00D4FF',92],['Bed Utilization','#8B5CF6',78],['On-time Starts','#10B981',85],['Discharge Eff.','#F97316',91]].map(([l,c,v]) => (
                    <div key={l as string} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: c as string }} />
                        <span className="text-vs-dim text-[10px]">{l}</span>
                      </div>
                      <span className="text-vs-text font-semibold">{v}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="vs-card p-4 flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-vs-text">Revenue Performance</p>
                <span className="text-[10px] text-vs-dim">This Month</span>
              </div>
              <div>
                <p className="text-lg font-bold text-white">$1.48M</p>
                <p className="text-[11px] text-vs-green flex items-center gap-1"><TrendingUp size={10} />14.2% vs last month</p>
              </div>
              <div className="flex-1" style={{ minHeight: 60 }}>
                <Spark data={revData} color="#00D4FF" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex gap-4" style={{ height: 200 }}>
          {/* Care Pathway */}
          <div className="vs-card p-4 flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-vs-text">Care Pathway</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-vs-cyan/10 text-vs-cyan border border-vs-cyan/20">Cardiology – CABG</span>
            </div>
            <div className="flex items-center gap-1 flex-1">
              {pathway.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                      step.active ? 'bg-vs-cyan/20 border-vs-cyan text-vs-cyan shadow-cyan' :
                      step.done  ? 'bg-vs-green/15 border-vs-green text-vs-green' :
                                   'bg-[#0F1835] border-[#1A2744] text-vs-dim'
                    }`}>
                      {step.done && !step.active ? '✓' : i + 1}
                    </div>
                    <p className="text-[9px] font-semibold text-center" style={{ color: step.active ? '#00D4FF' : step.done ? '#10B981' : '#64748B' }}>{step.label}</p>
                    <p className="text-[9px] text-vs-dim">{step.day}</p>
                  </div>
                  {i < pathway.length - 1 && (
                    <div className="flex-1 h-px" style={{ background: step.done ? '#10B981' : '#1A2744', minWidth: 8 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="vs-card p-4 w-64 flex-shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Brain size={14} className="text-vs-purple" />
              <p className="text-xs font-semibold text-vs-text">AI Insights</p>
            </div>
            <div className="space-y-2 flex-1 overflow-hidden">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[#0F1835] border border-[#1A2744]">
                  <span className="text-sm flex-shrink-0">{ins.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold ${ins.color}`}>{ins.title}</p>
                    <p className="text-[10px] text-vs-dim leading-tight mt-0.5 truncate">{ins.desc}</p>
                  </div>
                  <button className="text-[9px] px-1.5 py-0.5 rounded bg-[#1A2744] text-vs-dim hover:text-vs-cyan flex-shrink-0">View</button>
                </div>
              ))}
            </div>
          </div>

          {/* Staffing */}
          <div className="vs-card p-4 w-52 flex-shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-vs-text">Staffing Overview</p>
              <span className="text-[10px] text-vs-dim">This Week</span>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <div className="relative" style={{ width: 70, height: 70 }}>
                <PieChart width={70} height={70}>
                  <Pie data={staff} cx={30} cy={30} innerRadius={20} outerRadius={32} dataKey="value" strokeWidth={0}>
                    {staff.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-white">243</p>
                  <p className="text-[8px] text-vs-dim">Total</p>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {staff.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-vs-dim">{s.name}</span>
                    </div>
                    <span className="text-vs-text font-semibold">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
