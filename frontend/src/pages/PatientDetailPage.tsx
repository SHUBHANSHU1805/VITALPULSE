import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientService, VitalsService, getSocket } from '../services/api';
import { Patient, VitalRecord } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Heart, Droplets, Wind, ChevronRight, Video, Calendar, Clock, MapPin, Plus, Check } from 'lucide-react';

const Spark: React.FC<{data:number[];color:string}> = ({data,color}) => (
  <div style={{width:90,height:32}} className="sparkline">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data.map((v,i)=>({v,i}))}>
        <defs><linearGradient id={`sp${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.35}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sp${color.replace('#','')})`} dot={false} isAnimationActive={false}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const Gauge: React.FC<{pct:number;color:string;size?:number;label?:string}> = ({pct,color,size=100,label='Excellent'}) => {
  const r=(size-14)/2,c=size/2,circ=2*Math.PI*r,dash=(pct/100)*circ;
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#0D1B3E" strokeWidth={10}/>
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={10} strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round" style={{filter:`drop-shadow(0 0 10px ${color}aa)`}}/>
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black text-white mono">{pct}</p>
        <p className="text-[9px] text-vs-dim">{label}</p>
      </div>
    </div>
  );
};

// Enhanced body hologram
const BodyHologram: React.FC = () => (
  <div className="holo-panel w-full h-full flex items-center justify-center relative">
    <div className="holo-corners"/>
    {/* Grid */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none">
      {Array.from({length:12}).map((_,i)=><line key={`h${i}`} x1="0" y1={`${i*9.1}%`} x2="100%" y2={`${i*9.1}%`} stroke="#00D4FF" strokeWidth="0.5"/>)}
      {Array.from({length:14}).map((_,i)=><line key={`v${i}`} x1={`${i*7.7}%`} y1="0" x2={`${i*7.7}%`} y2="100%" stroke="#00D4FF" strokeWidth="0.5"/>)}
    </svg>
    {/* Ambient glow */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-64 h-72 rounded-full bg-vs-cyan/4 blur-3xl"/>
    </div>
    {/* Particles */}
    {[{x:'15%',y:'50%',d:'0s'},{x:'80%',y:'35%',d:'1s'},{x:'50%',y:'80%',d:'0.5s'},{x:'25%',y:'20%',d:'1.5s'},{x:'70%',y:'65%',d:'2s'}].map((p,i)=>(
      <div key={i} className="particle" style={{left:p.x,top:p.y,width:4,height:4,animationDelay:p.d,animationDuration:'3.5s'}}/>
    ))}
    {/* Body SVG */}
    <svg viewBox="0 0 160 340" className="body-glow relative z-10" style={{height:300,maxWidth:'100%'}}>
      {/* Head */}
      <ellipse cx="80" cy="28" rx="22" ry="26" fill="rgba(0,212,255,0.05)" stroke="rgba(0,212,255,0.5)" strokeWidth="1.2"/>
      {/* Neck */}
      <rect x="72" y="52" width="16" height="18" rx="5" fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.3)" strokeWidth="1"/>
      {/* Torso */}
      <path d="M52 70 L30 135 L33 205 L127 205 L130 135 L108 70 Z" fill="rgba(0,212,255,0.03)" stroke="rgba(0,212,255,0.42)" strokeWidth="1.2"/>
      {/* Arms */}
      <path d="M52 75 L22 145 L18 185" fill="none" stroke="rgba(0,212,255,0.42)" strokeWidth="8" strokeLinecap="round"/>
      <path d="M108 75 L138 145 L142 185" fill="none" stroke="rgba(0,212,255,0.42)" strokeWidth="8" strokeLinecap="round"/>
      {/* Legs */}
      <path d="M65 205 L58 278 L54 320" fill="none" stroke="rgba(0,212,255,0.42)" strokeWidth="10" strokeLinecap="round"/>
      <path d="M95 205 L102 278 L106 320" fill="none" stroke="rgba(0,212,255,0.42)" strokeWidth="10" strokeLinecap="round"/>
      {/* Ribs */}
      {[95,112,128,144].map((y,i)=>(
        <g key={i} opacity="0.2">
          <path d={`M76 ${y} C60 ${y-5},44 ${y+3},37 ${y+9}`} fill="none" stroke="#00D4FF" strokeWidth="0.8"/>
          <path d={`M84 ${y} C100 ${y-5},116 ${y+3},123 ${y+9}`} fill="none" stroke="#00D4FF" strokeWidth="0.8"/>
        </g>
      ))}
      {/* Spine */}
      {[85,100,115,130,145,160].map((y,i)=>(
        <rect key={i} x="77" y={y} width="6" height="5" rx="1" fill="rgba(0,212,255,0.15)" stroke="rgba(0,212,255,0.3)" strokeWidth="0.5"/>
      ))}
      {/* Lungs */}
      <path d="M62 92 C50 97,44 115,46 140 C48 158,56 167,66 162 L68 96 Z" fill="rgba(0,212,255,0.06)" stroke="rgba(0,212,255,0.32)" strokeWidth="0.9"/>
      <path d="M98 92 C110 97,116 115,114 140 C112 158,104 167,94 162 L92 96 Z" fill="rgba(0,212,255,0.06)" stroke="rgba(0,212,255,0.32)" strokeWidth="0.9"/>
      {/* Heart — glowing & animated */}
      <ellipse cx="78" cy="118" rx="13" ry="15" fill="rgba(255,70,40,0.18)" className="organ-glow-heart"/>
      <path d="M78 130 C70 123,62 116,66 108 C70 100,78 105,78 105 C78 105,86 100,90 108 C94 116,86 123,78 130Z" fill="rgba(255,70,40,0.70)" className="organ-glow-heart"/>
      {/* Neural network overlay dots */}
      {[[50,155],[110,148],[60,180],[100,176],[80,200]].map(([cx,cy],i)=>(
        <g key={i}>
          <circle cx={cx} cy={cy} r="2.5" fill="rgba(0,212,255,0.5)" style={{filter:'blur(0.5px)'}}/>
          <circle cx={cx} cy={cy} r="1.2" fill="#00D4FF"/>
        </g>
      ))}
      {/* Node connectors */}
      <line x1="50" y1="155" x2="60" y2="180" stroke="rgba(0,212,255,0.20)" strokeWidth="0.7"/>
      <line x1="60" y1="180" x2="80" y2="200" stroke="rgba(0,212,255,0.20)" strokeWidth="0.7"/>
      <line x1="110" y1="148" x2="100" y2="176" stroke="rgba(0,212,255,0.20)" strokeWidth="0.7"/>
      <line x1="100" y1="176" x2="80" y2="200" stroke="rgba(0,212,255,0.20)" strokeWidth="0.7"/>
    </svg>
    {/* Base platform rings */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
      {[120,90,60].map((w,i)=>(
        <div key={i} className="absolute rounded-full border border-vs-cyan/10" style={{width:w,height:w/4,opacity:1-i*0.25}}/>
      ))}
      <div className="w-24 h-4 rounded-full bg-vs-cyan/15 blur-md"/>
    </div>
  </div>
);

export const PatientDetailPage: React.FC = () => {
  const {id} = useParams<{id:string}>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient|null>(null);
  const [vitals, setVitals]   = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mv, setMv] = useState({heartRate:'78',bpSystolic:'120',bpDiastolic:'80',spo2:'97',temperature:'36.8'});

  useEffect(() => {
    if (!id) return;
    PatientService.getPatientById(id).then(p=>{setPatient(p);setVitals(p.vitals??[]);setLoading(false);});
    const s = getSocket();
    s.emit('subscribe_patient', id);
    s.on('vitals_update',(v:VitalRecord)=>{if(v.patientId===id)setVitals(p=>[...p.slice(-49),v]);});
    return()=>{s.emit('unsubscribe_patient',id);s.off('vitals_update');};
  },[id]);

  const addVitals = async (e:React.FormEvent) => {
    e.preventDefault(); if(!id) return;
    const rec = await VitalsService.addVitalRecord(id,{heartRate:+mv.heartRate,bpSystolic:+mv.bpSystolic,bpDiastolic:+mv.bpDiastolic,spo2:+mv.spo2,temperature:+mv.temperature});
    setVitals(p=>[...p,rec]); setShowModal(false);
  };

  if(loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-vs-cyan border-t-transparent rounded-full animate-spin"/></div>;
  if(!patient) return <div className="text-vs-dim p-8">Patient not found.</div>;

  const lv = vitals[vitals.length-1]??patient.latestVital;
  const hrData  = vitals.slice(-12).map(v=>v.heartRate);
  const bpData  = vitals.slice(-12).map(v=>v.bpSystolic);
  const spo2Data = vitals.slice(-12).map(v=>v.spo2);
  const wellness = Math.max(40, 100-(patient.riskScore??30));

  const journey=[
    {l:'Diagnosis',    d:'May 10, 2025', done:true},
    {l:'Treatment Plan',d:'May 12, 2025',done:true},
    {l:'Recovery',     d:'In Progress',  active:true},
    {l:'Follow-up',    d:'Jun 10, 2025', done:false},
    {l:'Maintenance',  d:'Ongoing',      done:false},
  ];

  const inp="w-full p-2 bg-[#0D1B3E] border border-[#1A2744] rounded-lg text-xs text-vs-text focus:outline-none focus:border-vs-cyan/50 transition-colors mono";

  return (
    <div className="flex flex-col gap-3">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <button onClick={()=>navigate('/patients')} className="flex items-center gap-2 text-xs text-vs-dim hover:text-vs-cyan transition-colors">
          <ArrowLeft size={13}/>Back to Patients
        </button>
        <div className="flex gap-2">
          <button onClick={()=>setShowModal(true)} className="px-3 py-1.5 rounded-lg btn-neon text-xs flex items-center gap-1.5"><Plus size={11}/>Log Vitals</button>
          <button className="px-4 py-1.5 rounded-lg btn-gradient text-white text-xs font-bold flex items-center gap-1.5"><Video size={11}/>Launch Tele-Call</button>
        </div>
      </div>

      {/* 3-col */}
      <div className="flex gap-3" style={{minHeight:360}}>
        {/* LEFT */}
        <div className="w-60 flex-shrink-0 flex flex-col gap-3">
          {/* Patient card */}
          <div className="vs-card vs-card-glow p-5 flex flex-col gap-3">
            <p className="text-[9px] font-bold text-vs-dim uppercase tracking-widest">Patient</p>
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className="orbit-ring absolute -inset-2 rounded-full"/>
                <div className="w-14 h-14 rounded-full border-2 bg-gradient-to-br from-vs-cyan/20 to-vs-purple/20 flex items-center justify-center text-lg font-black" style={{borderColor:'rgba(0,212,255,0.45)',color:'#00D4FF',textShadow:'0 0 12px rgba(0,212,255,0.8)'}}>
                  {patient.name.slice(0,2).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{patient.name}</h2>
                <p className="text-[10px] text-vs-dim mt-0.5">{patient.age} yrs · {patient.gender}</p>
                <p className="text-[10px] text-vs-dim mono">MRN {patient.id.slice(0,8).toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{width:7,height:7,borderRadius:'50%',background:'#10B981',boxShadow:'0 0 8px #10B981'}}/>
              <span className="text-xs font-bold text-vs-green">Stable</span>
            </div>
            <button className="w-full py-2 rounded-lg btn-neon text-xs flex items-center justify-center gap-1.5">Open Profile<ChevronRight size={11}/></button>
          </div>

          {/* Key Vitals */}
          <div className="vs-card p-4 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-vs-text">Key Vitals</p>
              <div className="flex items-center gap-1.5"><div className="live-dot" style={{width:6,height:6}}/><span className="text-[9px] text-vs-green font-bold">LIVE</span></div>
            </div>
            {[
              {icon:<Heart size={15} className="text-vs-rose"/>,bg:'bg-vs-rose/15 border-vs-rose/30',label:'Heart Rate',val:lv?`${lv.heartRate} bpm`:'-- bpm',data:hrData.length?hrData:[70,72,75,71,74,73,75,72],color:'#F43F5E'},
              {icon:<Droplets size={15} className="text-vs-purple"/>,bg:'bg-vs-purple/15 border-vs-purple/30',label:'Blood Pressure',val:lv?`${lv.bpSystolic}/${lv.bpDiastolic}`:'--/--',data:bpData.length?bpData:[118,122,120,124,121,119,123,124],color:'#8B5CF6'},
              {icon:<Wind size={15} className="text-vs-cyan"/>,bg:'bg-vs-cyan/15 border-vs-cyan/30',label:'Oxygen Saturation',val:lv?`${lv.spo2}%`:'--',data:spo2Data.length?spo2Data:[96,97,97,98,97,96,97,97],color:'#00D4FF'},
            ].map(v=>(
              <div key={v.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${v.bg}`}>{v.icon}</div>
                  <div>
                    <p className="text-[9px] text-vs-dim">{v.label}</p>
                    <p className="text-sm font-black text-white mono">{v.val}</p>
                  </div>
                </div>
                <Spark data={v.data} color={v.color}/>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — Body hologram */}
        <div className="flex-1 vs-card overflow-hidden" style={{minHeight:360}}>
          <BodyHologram/>
        </div>

        {/* RIGHT */}
        <div className="w-60 flex-shrink-0 flex flex-col gap-3">
          {/* Wellness Score */}
          <div className="vs-card p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-vs-text">Wellness Score</p>
            <div className="flex items-center gap-3">
              <Gauge pct={wellness} color="#00D4FF" size={88}/>
              <div className="space-y-1.5 flex-1">
                {[{l:'Activity',v:90,c:'#00D4FF'},{l:'Sleep',v:82,c:'#8B5CF6'},{l:'Nutrition',v:85,c:'#F97316'},{l:'Mental',v:88,c:'#10B981'}].map(w=>(
                  <div key={w.l} className="flex justify-between text-[10px]">
                    <span className="text-vs-dim">{w.l}</span>
                    <span className="font-black mono" style={{color:w.c}}>{w.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-vs-green">↑ 12% improvement vs last month</p>
          </div>

          {/* Upcoming Appointment */}
          <div className="vs-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2"><Calendar size={12} className="text-vs-cyan"/><p className="text-xs font-semibold text-vs-text">Upcoming Appointment</p></div>
            <div className="flex gap-3">
              <div className="bg-[#0D1B3E] border border-[#1A2744] rounded-xl p-2.5 text-center flex-shrink-0" style={{boxShadow:'0 0 12px rgba(0,212,255,0.08)'}}>
                <p className="text-[9px] text-vs-cyan font-black uppercase tracking-widest">MAY</p>
                <p className="text-2xl font-black text-white mono leading-none">26</p>
                <p className="text-[9px] text-vs-dim">2025</p>
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cardiology Consultation</p>
                <p className="text-[10px] text-vs-dim flex items-center gap-1 mt-1"><Clock size={9}/>09:30 AM</p>
                <p className="text-[10px] text-vs-dim flex items-center gap-1 mt-0.5"><MapPin size={9}/>Room 12A</p>
              </div>
            </div>
            <button className="w-full py-2 rounded-lg btn-neon text-xs flex items-center justify-center gap-1.5">View Appointment<ChevronRight size={11}/></button>
          </div>

          {/* Medications */}
          <div className="vs-card p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-vs-text">Medications</p>
              <span className="text-[9px] px-2 py-0.5 rounded-full btn-neon">{patient.medicalHistories?.length??2} Active</span>
            </div>
            {(patient.medicalHistories?.flatMap(h=>h.medications??[]).slice(0,3)??['Aspirin 81mg','Metoprolol 25mg']).map((med,i)=>(
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0D1B3E] border border-[#1A2744]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{background:i%2===0?'rgba(0,212,255,0.12)':'rgba(139,92,246,0.12)'}}>💊</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-vs-text truncate">{med}</p>
                  <p className="text-[9px] text-vs-dim">{i%2===0?'Once daily':'Twice daily'}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-vs-green" style={{boxShadow:'0 0 6px #10B981'}}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Care Journey */}
      <div className="vs-card p-5">
        <p className="text-xs font-semibold text-vs-text mb-4">Care Journey</p>
        <div className="flex items-start gap-2">
          {journey.map((step,i)=>(
            <React.Fragment key={step.l}>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{minWidth:90}}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step.active?'border-vs-cyan bg-vs-cyan/15':step.done?'border-vs-green bg-vs-green/10':'border-[#1A2744] bg-[#0D1B3E]'}`}
                  style={step.active?{boxShadow:'0 0 20px rgba(0,212,255,0.4)'}:{}}>
                  {step.done&&!step.active?<Check size={16} className="text-vs-green"/>:step.active?<Heart size={16} className="text-vs-cyan"/>:<div className="w-4 h-4 rounded-full border border-[#1A2744]"/>}
                </div>
                <p className="text-[11px] font-bold text-center" style={{color:step.active?'#00D4FF':step.done?'#10B981':'#64748B'}}>{step.l}</p>
                <p className="text-[9px] text-vs-dim text-center mono">{step.d}</p>
                {step.active&&<p className="text-[9px] text-vs-cyan font-black" style={{textShadow:'0 0 8px rgba(0,212,255,0.6)'}}>In Progress</p>}
              </div>
              {i<journey.length-1&&<div className="flex-1 h-0.5 mt-5 rounded-full" style={{background:step.done?'linear-gradient(90deg,#10B981,#10B98188)':'#1A2744'}}/>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#060E23] border border-vs-cyan/20 rounded-2xl p-6 space-y-4" style={{boxShadow:'0 0 40px rgba(0,212,255,0.15)'}}>
            <h3 className="text-sm font-bold text-white">Log Manual Vitals</h3>
            <form onSubmit={addVitals} className="space-y-3">
              {([['Heart Rate (bpm)','heartRate'],['SpO2 (%)','spo2'],['Temperature (°C)','temperature']] as [string,string][]).map(([label,key])=>(
                <div key={key}><label className="text-[9px] text-vs-dim uppercase font-semibold tracking-wider">{label}</label>
                  <input type="number" step="0.1" value={(mv as any)[key]} onChange={e=>setMv(p=>({...p,[key]:e.target.value}))} className={inp}/></div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                {([['Systolic','bpSystolic'],['Diastolic','bpDiastolic']] as [string,string][]).map(([label,key])=>(
                  <div key={key}><label className="text-[9px] text-vs-dim uppercase font-semibold tracking-wider">{label}</label>
                    <input type="number" value={(mv as any)[key]} onChange={e=>setMv(p=>({...p,[key]:e.target.value}))} className={inp}/></div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2 rounded-lg bg-[#0D1B3E] border border-[#1A2744] text-xs text-vs-dim hover:text-vs-text transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg btn-gradient text-white text-xs font-bold">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
