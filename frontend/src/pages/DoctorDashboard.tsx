import React, { useState, useEffect } from 'react';
import { PatientService, AlertService, ConsultationService } from '../services/api';
import { Patient, Alert, Consultation } from '../types';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MoreHorizontal, TrendingUp, TrendingDown, Users, AlertTriangle, Calendar, Plus, ChevronRight, Brain, Activity } from 'lucide-react';

const Spark: React.FC<{ data: number[]; color: string }> = ({ data, color }) => (
  <ResponsiveContainer width={80} height={28}>
    <AreaChart data={data.map((v,i)=>({v,i}))}>
      <defs><linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.4}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g${color.replace('#','')})`} dot={false} isAnimationActive={false}/>
    </AreaChart>
  </ResponsiveContainer>
);

const DonutArc: React.FC<{pct:number;size?:number;color:string;trail?:string}> = ({pct,size=80,color,trail='#0D1B3E'}) => {
  const r=(size-12)/2,c=size/2,circ=2*Math.PI*r,dash=(pct/100)*circ;
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke={trail} strokeWidth={9}/>
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={9} strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${color}99)`}}/>
      </svg>
      <div className="absolute text-center">
        <p className="text-sm font-black text-white">{pct}%</p>
        <p className="text-[9px] text-vs-dim">Excellent</p>
      </div>
    </div>
  );
};

const KPI: React.FC<{icon:React.ReactNode;bg:string;label:string;value:string|number;trend:string;up:boolean}> = ({icon,bg,label,value,trend,up}) => (
  <div className="vs-card vs-card-glow p-4 flex items-start justify-between group">
    <div>
      <p className="text-[10px] text-vs-dim uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white mt-1 mono">{value}</p>
      <p className={`text-[10px] mt-1 flex items-center gap-1 ${up?'text-vs-green':'text-vs-rose'}`}>
        {up?<TrendingUp size={9}/>:<TrendingDown size={9}/>}{trend}
      </p>
    </div>
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>{icon}</div>
  </div>
);

// Animated holographic lung SVG
const LungHologram: React.FC = () => (
  <div className="holo-panel w-full h-full flex items-center justify-center relative">
    <div className="holo-corners"/>
    {/* Animated particles */}
    {[{x:'20%',y:'60%',d:'0s',s:4},{x:'70%',y:'40%',d:'1.2s',s:3},{x:'50%',y:'75%',d:'0.6s',s:5},{x:'30%',y:'30%',d:'1.8s',s:3}].map((p,i)=>(
      <div key={i} className="particle" style={{left:p.x,top:p.y,width:p.s,height:p.s,animationDelay:p.d,animationDuration:'3s'}}/>
    ))}
    {/* Grid overlay */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
      {Array.from({length:10}).map((_,i)=><line key={`h${i}`} x1="0" y1={`${i*11.1}%`} x2="100%" y2={`${i*11.1}%`} stroke="#00D4FF" strokeWidth="0.5"/>)}
      {Array.from({length:12}).map((_,i)=><line key={`v${i}`} x1={`${i*9.1}%`} y1="0" x2={`${i*9.1}%`} y2="100%" stroke="#00D4FF" strokeWidth="0.5"/>)}
    </svg>
    {/* Center glow orb */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-52 h-52 rounded-full bg-vs-cyan/5 blur-3xl"/>
    </div>
    {/* Lung SVG */}
    <svg viewBox="0 0 240 220" className="body-glow relative z-10" style={{height:200,maxWidth:'100%'}}>
      {/* Trachea */}
      <line x1="120" y1="8" x2="120" y2="38" stroke="rgba(0,212,255,0.8)" strokeWidth="4" strokeLinecap="round"/>
      <line x1="120" y1="38" x2="96" y2="52" stroke="rgba(0,212,255,0.65)" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="120" y1="38" x2="144" y2="52" stroke="rgba(0,212,255,0.65)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Left Lung */}
      <path d="M96 52 C70 55, 36 75, 32 115 C28 150, 44 185, 78 192 C92 195, 100 185, 100 172 L100 52 Z" fill="rgba(0,212,255,0.07)" stroke="rgba(0,212,255,0.55)" strokeWidth="1.5"/>
      {/* Right Lung */}
      <path d="M144 52 C170 55, 204 75, 208 115 C212 150, 196 185, 162 192 C148 195, 140 185, 140 172 L140 52 Z" fill="rgba(0,212,255,0.07)" stroke="rgba(0,212,255,0.55)" strokeWidth="1.5"/>
      {/* Bronchial branches left */}
      <line x1="100" y1="70" x2="80" y2="90" stroke="rgba(0,212,255,0.35)" strokeWidth="1.2"/>
      <line x1="80" y1="90" x2="62" y2="110" stroke="rgba(0,212,255,0.25)" strokeWidth="1"/>
      <line x1="80" y1="90" x2="72" y2="118" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
      {/* Bronchial branches right */}
      <line x1="140" y1="70" x2="160" y2="90" stroke="rgba(0,212,255,0.35)" strokeWidth="1.2"/>
      <line x1="160" y1="90" x2="178" y2="110" stroke="rgba(0,212,255,0.25)" strokeWidth="1"/>
      <line x1="160" y1="90" x2="168" y2="118" stroke="rgba(0,212,255,0.2)" strokeWidth="0.8"/>
      {/* Ribs */}
      {[80,100,120,140,160].map((y,i)=>(
        <g key={i} opacity={0.18}>
          <path d={`M100 ${y} C78 ${y-6}, 52 ${y+4}, 44 ${y+12}`} fill="none" stroke="#00D4FF" strokeWidth="0.8"/>
          <path d={`M140 ${y} C162 ${y-6}, 188 ${y+4}, 196 ${y+12}`} fill="none" stroke="#00D4FF" strokeWidth="0.8"/>
        </g>
      ))}
      {/* Anomaly hotspot 1 — Atelectasis (left lower) */}
      <circle cx="65" cy="145" r="16" fill="rgba(244,63,94,0.15)"/>
      <circle cx="65" cy="145" r="8" fill="rgba(244,63,94,0.45)" style={{filter:'blur(1px)'}}/>
      <circle cx="65" cy="145" r="4" fill="rgba(244,63,94,0.9)" style={{animation:'pulseCrit 1.8s infinite'}}/>
      {/* Anomaly hotspot 2 — Nodule (right upper) */}
      <circle cx="180" cy="90" r="12" fill="rgba(249,115,22,0.15)"/>
      <circle cx="180" cy="90" r="6" fill="rgba(249,115,22,0.5)" style={{filter:'blur(1px)'}}/>
      <circle cx="180" cy="90" r="3" fill="rgba(249,115,22,0.95)" style={{animation:'pulseCrit 2.2s infinite'}}/>
      {/* Diagnostic node connectors */}
      <line x1="65" y1="145" x2="30" y2="155" stroke="rgba(244,63,94,0.5)" strokeWidth="0.8" strokeDasharray="3 2"/>
      <line x1="180" y1="90" x2="215" y2="75" stroke="rgba(249,115,22,0.5)" strokeWidth="0.8" strokeDasharray="3 2"/>
    </svg>
    {/* Callout cards */}
    <div className="absolute top-3 left-3 bg-[#040912]/90 border border-vs-rose/30 rounded-xl p-2.5 backdrop-blur-sm" style={{boxShadow:'0 0 16px rgba(244,63,94,0.15)'}}>
      <p className="text-[9px] text-vs-dim">Atelectasis · Probability</p>
      <p className="text-xl font-black text-vs-rose mono">78%</p>
      <p className="text-[9px] text-vs-cyan mt-0.5">Lower Lobe · Right Lung</p>
    </div>
    <div className="absolute top-3 right-3 bg-[#040912]/90 border border-vs-amber/30 rounded-xl p-2.5 backdrop-blur-sm" style={{boxShadow:'0 0 16px rgba(249,115,22,0.15)'}}>
      <p className="text-[9px] text-vs-dim">Nodule Detected · Prob.</p>
      <p className="text-xl font-black text-vs-amber mono">62%</p>
      <p className="text-[9px] text-vs-cyan mt-0.5">Upper Lobe · Left Lung</p>
    </div>
    {/* Bottom controls */}
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
      <button className="btn-neon text-[10px] px-3 py-1 rounded-lg flex items-center gap-1.5"><Activity size={10}/>Rotate</button>
      <div className="flex gap-1">{[0,1,2,3,4].map(i=><div key={i} className={`w-1.5 h-1.5 rounded-full ${i===1?'bg-vs-cyan':' bg-[#1A2744]'}`}/>)}</div>
      <span className="text-[10px] text-vs-dim mono">Zoom −  +</span>
    </div>
  </div>
);

export const DoctorDashboard: React.FC = () => {
  const [patients, setPatients]     = useState<Patient[]>([]);
  const [alerts,   setAlerts]       = useState<Alert[]>([]);
  const [consults, setConsults]     = useState<Consultation[]>([]);

  useEffect(() => {
    PatientService.getAllPatients({}).then(setPatients).catch(()=>{});
    AlertService.getAlerts({resolved:false}).then(setAlerts).catch(()=>{});
    ConsultationService.getConsultations().then(setConsults).catch(()=>{});
  }, []);

  const sample = patients[0];
  const active = alerts.filter(a=>!a.resolved);
  const revData = [0.7,0.9,0.85,1.0,1.1,1.05,1.2,1.35,1.48];
  const staff = [{name:'Physicians',value:26,color:'#3B82F6'},{name:'Nurses',value:46,color:'#8B5CF6'},{name:'Technicians',value:14,color:'#F97316'},{name:'Support',value:14,color:'#10B981'}];
  const schedItems = consults.slice(0,4).map((c,i)=>({time:['09:30 AM','10:45 AM','01:15 PM','03:30 PM'][i]??'--',type:['Consultation','Follow-up','Procedure','Review'][i]??'Consult',room:c.patient?.roomNumber??'ICU',init:c.patient?.name?.slice(0,2).toUpperCase()??'PT',color:['#00D4FF','#10B981','#8B5CF6','#F97316'][i]??'#00D4FF'}));
  const insights=[{icon:'🧠',title:'High readmission risk',desc:'Similar cases: 28% rate.',c:'text-vs-rose'},{icon:'💊',title:'Medication adjustment',desc:'Review beta-blocker dose.',c:'text-vs-amber'},{icon:'⚠️',title:'Sepsis risk elevated',desc:'Monitor vitals closely.',c:'text-vs-orange'}];
  const pathway=[{l:'Referral',d:'Day 0',done:true},{l:'Consult',d:'Day 1',done:true},{l:'Diagnostics',d:'Day 2-3',done:true},{l:'Procedure',d:'Day 4',active:true},{l:'Recovery',d:'Day 5-7',done:false},{l:'Follow-up',d:'Day 30',done:false}];

  return (
    <div className="flex gap-3 h-full min-h-0" style={{minHeight:'calc(100vh - 3.5rem - 40px)'}}>
      {/* LEFT PANEL */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-3">
        {/* Patient Overview */}
        <div className="vs-card vs-card-glow p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-vs-dim uppercase tracking-widest">Patient Overview</p>
            <MoreHorizontal size={13} className="text-vs-dim"/>
          </div>
          {sample ? (
            <>
              <div className="flex flex-col items-center gap-2">
                {/* Avatar with orbit ring */}
                <div className="relative">
                  <div className="orbit-ring absolute -inset-2 border border-vs-cyan/15 rounded-full"/>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-vs-cyan/20 to-vs-purple/20 border-2 flex items-center justify-center text-lg font-black" style={{borderColor:'rgba(0,212,255,0.4)',color:'#00D4FF',textShadow:'0 0 12px rgba(0,212,255,0.8)'}}>
                    {sample.name.slice(0,2).toUpperCase()}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white">{sample.name}</p>
                  <p className="text-[10px] text-vs-dim mono">#{sample.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>
              {[['Age',`${sample.age} · ${sample.gender}`],['Blood',sample.bloodType??'O+'],['Ward',sample.ward]].map(([k,v])=>(
                <div key={k} className="flex justify-between text-[11px]">
                  <span className="text-vs-dim">{k}</span>
                  <span className="text-vs-text font-semibold">{v}</span>
                </div>
              ))}
              <button className="w-full py-2 rounded-lg btn-neon text-[11px] flex items-center justify-center gap-1.5">View Full Profile <ChevronRight size={11}/></button>
            </>
          ):<p className="text-xs text-vs-dim text-center py-4">Loading…</p>}
        </div>

        {/* Schedule */}
        <div className="vs-card p-4 flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-vs-dim uppercase tracking-widest">Today's Schedule</p>
            <button className="text-[10px] text-vs-cyan hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {schedItems.length>0?schedItems.map((s,i)=>(
              <div key={i} className="flex items-center gap-2">
                <div className="text-[9px] text-vs-dim mono w-14 flex-shrink-0">{s.time}</div>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.color,boxShadow:`0 0 8px ${s.color}`}}/>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-vs-text truncate">{s.type}</p>
                  <p className="text-[9px] text-vs-dim">Rm {s.room}</p>
                </div>
                <div className="w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-bold" style={{borderColor:`${s.color}55`,color:s.color}}>{s.init}</div>
              </div>
            )):<p className="text-xs text-vs-dim text-center py-2">No appointments</p>}
          </div>
          <button className="mt-auto w-full py-2 rounded-lg border border-dashed border-[#1A2744] text-[11px] text-vs-dim flex items-center justify-center gap-1.5 hover:border-vs-cyan/30 hover:text-vs-cyan transition-colors">
            <Plus size={11}/>Add Appointment
          </button>
        </div>
      </div>

      {/* CENTER + RIGHT */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Top */}
        <div className="flex gap-3" style={{height:280}}>
          {/* Hologram */}
          <div className="flex-1 flex flex-col vs-card overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Pulmonary Analysis</h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-vs-green/10 border border-vs-green/25">
                  <div className="live-dot" style={{width:6,height:6}}/>
                  <span className="text-[9px] font-bold text-vs-green">LIVE</span>
                </div>
              </div>
              <span className="text-[9px] text-vs-dim mono">3D Imaging · Real-time · 4K</span>
            </div>
            <div className="flex-1"><LungHologram/></div>
          </div>

          {/* KPIs */}
          <div className="w-60 flex-shrink-0 flex flex-col gap-2">
            <KPI icon={<Users size={14} className="text-vs-cyan"/>} bg="bg-vs-cyan/10" label="Total Patients" value={patients.length||2846} trend="↑ 12.6% vs last week" up={true}/>
            <KPI icon={<Calendar size={14} className="text-vs-purple"/>} bg="bg-vs-purple/10" label="Appointments" value={consults.length||342} trend="↑ 8.4% vs last week" up={true}/>
            <KPI icon={<AlertTriangle size={14} className="text-vs-rose"/>} bg="bg-vs-rose/10" label="Critical Alerts" value={active.length||8} trend="↑ 20% vs last week" up={false}/>
            {/* Operational Efficiency */}
            <div className="vs-card p-3 flex items-center gap-3 flex-1">
              <DonutArc pct={87} size={66} color="#00D4FF"/>
              <div className="space-y-1 flex-1">
                {[['Throughput','#00D4FF',92],['Bed Util.','#8B5CF6',78],['On-time','#10B981',85]].map(([l,c,v])=>(
                  <div key={l as string} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{background:c as string}}/><span className="text-vs-dim">{l}</span></div>
                    <span className="mono font-bold text-vs-text">{v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="vs-card p-4 flex items-center gap-4" style={{height:80}}>
          <div className="flex-shrink-0">
            <p className="text-[10px] text-vs-dim uppercase tracking-wider">Revenue Performance</p>
            <p className="text-xl font-black text-white mono">$1.48M</p>
            <p className="text-[10px] text-vs-green flex items-center gap-1"><TrendingUp size={9}/>14.2% vs last month</p>
          </div>
          <div className="flex-1 h-full"><Spark data={revData} color="#00D4FF"/></div>
        </div>

        {/* Bottom row */}
        <div className="flex gap-3 flex-1" style={{minHeight:160}}>
          {/* Care Pathway */}
          <div className="vs-card p-4 flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-vs-text">Care Pathway</p>
              <span className="text-[9px] px-2 py-0.5 rounded-full btn-neon">Cardiology – CABG</span>
            </div>
            <div className="flex items-center gap-1 flex-1 overflow-x-auto">
              {pathway.map((step,i)=>(
                <React.Fragment key={step.l}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-[10px] font-bold ${step.active?'border-vs-cyan bg-vs-cyan/15 text-vs-cyan':step.done?'border-vs-green bg-vs-green/10 text-vs-green':'border-[#1A2744] bg-[#0D1B3E] text-vs-dim'}`}
                      style={step.active?{boxShadow:'0 0 16px rgba(0,212,255,0.4)'}:{}}>
                      {step.done&&!step.active?'✓':i+1}
                    </div>
                    <p className="text-[9px] font-semibold text-center" style={{color:step.active?'#00D4FF':step.done?'#10B981':'#64748B'}}>{step.l}</p>
                    <p className="text-[9px] text-vs-dim mono">{step.d}</p>
                  </div>
                  {i<pathway.length-1&&<div className="flex-1 h-px" style={{background:step.done?'#10B981':'#1A2744',minWidth:8}}/>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="vs-card p-4 w-60 flex-shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-2"><Brain size={13} className="text-vs-purple"/><p className="text-xs font-semibold text-vs-text">AI Insights</p></div>
            {insights.map((ins,i)=>(
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-[#0D1B3E]/80 border border-[#1A2744] hover:border-vs-cyan/20 transition-colors">
                <span className="text-sm flex-shrink-0">{ins.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold ${ins.c}`}>{ins.title}</p>
                  <p className="text-[9px] text-vs-dim mt-0.5 truncate">{ins.desc}</p>
                </div>
                <button className="text-[9px] px-1.5 py-0.5 rounded btn-neon flex-shrink-0">View</button>
              </div>
            ))}
          </div>

          {/* Staffing */}
          <div className="vs-card p-4 w-48 flex-shrink-0 flex flex-col gap-2">
            <p className="text-xs font-semibold text-vs-text">Staffing Overview</p>
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-shrink-0">
                <PieChart width={64} height={64}>
                  <Pie data={staff} cx={28} cy={28} innerRadius={18} outerRadius={30} dataKey="value" strokeWidth={0}>
                    {staff.map((s,i)=><Cell key={i} fill={s.color}/>)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs font-black text-white mono">243</p>
                  <p className="text-[8px] text-vs-dim">Staff</p>
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                {staff.map(s=>(
                  <div key={s.name} className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{background:s.color}}/><span className="text-vs-dim">{s.name}</span></div>
                    <span className="mono font-bold text-vs-text">{s.value}%</span>
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
