import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '../services/api';
import { Patient } from '../types';
import { Search, UserPlus, ChevronRight, Heart, Activity } from 'lucide-react';

export const PatientRosterPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ward, setWard] = useState('ALL');

  useEffect(() => {
    PatientService.getAllPatients({ search, ward }).then(p => { setPatients(p); setLoading(false); });
  }, [search, ward]);

  const riskColor: Record<string, string> = {
    LOW:'text-vs-green', MODERATE:'text-vs-amber', HIGH:'text-vs-orange', CRITICAL:'text-vs-rose',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Patient Directory</h1>
          <p className="text-xs text-vs-dim mt-0.5">Active telemetry roster · {patients.length} records</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-vs-cyan to-vs-purple text-white text-xs font-bold flex items-center gap-2 shadow-cyan hover:opacity-90 transition-opacity">
          <UserPlus size={13} /> Register Patient
        </button>
      </div>

      {/* Filters */}
      <div className="vs-card p-3 flex flex-wrap items-center gap-3">
        <div className="relative w-60">
          <Search className="w-3.5 h-3.5 text-vs-dim absolute left-3 top-2.5" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, room..."
            className="w-full pl-9 pr-3 py-2 bg-[#0F1835] border border-[#1A2744] rounded-lg text-xs text-vs-text placeholder-vs-dim focus:outline-none focus:border-vs-cyan/50 transition-colors" />
        </div>
        <select value={ward} onChange={e => setWard(e.target.value)}
          className="px-3 py-2 bg-[#0F1835] border border-[#1A2744] rounded-lg text-xs text-vs-text focus:outline-none focus:border-vs-cyan/50 transition-colors">
          <option value="ALL">All Wards</option>
          <option value="ICU">ICU</option>
          <option value="CARDIOLOGY">Cardiology</option>
          <option value="PULMONOLOGY">Pulmonology</option>
          <option value="NEUROLOGY">Neurology</option>
          <option value="GENERAL WARD">General Ward</option>
        </select>
      </div>

      {/* Table */}
      <div className="vs-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-vs-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#0F1835] border-b border-[#1A2744]">
              <tr className="text-[10px] font-semibold text-vs-dim uppercase tracking-wider">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Heart Rate</th>
                <th className="py-3 px-4">SpO2</th>
                <th className="py-3 px-4">BP</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2744]/50">
              {patients.map(p => {
                const lv = p.latestVital;
                const isCrit = p.riskLevel === 'CRITICAL';
                return (
                  <tr key={p.id} onClick={() => navigate(`/patients/${p.id}`)}
                    className={`cursor-pointer transition-colors hover:bg-[#0F1835] ${isCrit ? 'bg-vs-rose/3' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          isCrit ? 'border-vs-rose/50 bg-vs-rose/15 text-vs-rose pulse-critical' :
                                   'border-vs-cyan/30 bg-vs-cyan/10 text-vs-cyan'
                        }`}>
                          {p.name.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-vs-text">{p.name}</p>
                          <p className="text-[10px] text-vs-dim">Ward {p.ward} · Rm {p.roomNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-vs-dim">{p.age}y · {p.gender}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Heart size={12} className={lv && lv.heartRate > 100 ? 'text-vs-rose animate-bounce' : 'text-vs-dim'} />
                        <span className={lv && lv.heartRate > 100 ? 'text-vs-rose font-bold' : 'text-vs-text'}>{lv?.heartRate ?? '--'} bpm</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-semibold ${lv && lv.spo2 < 92 ? 'text-vs-rose' : 'text-vs-cyan'}`}>
                        {lv?.spo2 ?? '--'}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-vs-dim">{lv ? `${lv.bpSystolic}/${lv.bpDiastolic}` : '--'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-bold ${riskColor[p.riskLevel] ?? 'text-vs-dim'}`}>{p.riskLevel}</span>
                      <span className="text-[10px] text-vs-dim ml-1.5 font-mono">{p.riskScore}/100</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 rounded-lg bg-[#0F1835] border border-[#1A2744] hover:border-vs-cyan/30 text-vs-dim hover:text-vs-cyan transition-colors">
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
