import React, { useState, useEffect } from 'react';
import { PatientService } from '../services/api';
import { Patient } from '../types';
import { PatientListTable } from '../components/dashboard/PatientListTable';
import { Search, UserPlus, SlidersHorizontal } from 'lucide-react';

export const PatientRosterPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [minRisk, setMinRisk] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [newPatient, setNewPatient] = useState({
    name: '', age: '', gender: 'Female', bloodType: 'O+', roomNumber: 'ICU-105', ward: 'ICU', phone: '',
  });

  const fetchPatients = async () => {
    try {
      const res = await PatientService.getAllPatients({
        search: searchQuery,
        ward: selectedWard,
        minRiskScore: minRisk > 0 ? minRisk : undefined,
      });
      setPatients(res);
    } catch (err) {
      console.error('Error fetching roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, [searchQuery, selectedWard, minRisk]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PatientService.createPatient({ ...newPatient, age: Number(newPatient.age) });
      setShowAddModal(false);
      setNewPatient({ name: '', age: '', gender: 'Female', bloodType: 'O+', roomNumber: 'ICU-105', ward: 'ICU', phone: '' });
      fetchPatients();
    } catch (err) {
      console.error('Failed to create patient:', err);
    }
  };

  const inputCls = "w-full p-2.5 rounded-xl bg-[rgba(15,23,42,0.80)] border border-[rgba(59,130,246,0.15)] text-xs text-slate-100 focus:outline-none focus:border-blue-500/50 transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-wide">Patient Directory & Triage Roster</h1>
          <p className="text-xs text-slate-400">Search, filter, and review active hospital patient telemetry records</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center space-x-2 shadow-glow-blue hover:from-blue-500 hover:to-indigo-500 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-[rgba(59,130,246,0.12)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, room..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[rgba(15,23,42,0.80)] border border-[rgba(59,130,246,0.15)] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[rgba(15,23,42,0.80)] border border-[rgba(59,130,246,0.15)] text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 font-semibold transition-all"
          >
            <option value="ALL">All Clinical Wards</option>
            <option value="ICU">ICU Unit</option>
            <option value="CARDIOLOGY">Cardiology</option>
            <option value="PULMONOLOGY">Pulmonology</option>
            <option value="NEUROLOGY">Neurology</option>
            <option value="GENERAL WARD">General Ward</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 w-full lg:w-auto text-xs">
          <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400 font-semibold">Min Risk Threshold:</span>
          <input
            type="range" min="0" max="80" step="10" value={minRisk}
            onChange={(e) => setMinRisk(Number(e.target.value))}
            className="w-28 accent-blue-500 cursor-pointer"
          />
          <span className="font-mono font-bold text-blue-400 px-2 py-0.5 rounded-lg bg-[rgba(59,130,246,0.10)] border border-[rgba(59,130,246,0.20)]">
            {minRisk}+
          </span>
        </div>
      </div>

      <PatientListTable patients={patients} isLoading={isLoading} />

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0F172A] border border-[rgba(59,130,246,0.20)] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Register New Telemetry Patient</h3>
            <form onSubmit={handleCreatePatient} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input type="text" required value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. David Ross" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Age</label>
                  <input type="number" required value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="58" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Gender</label>
                  <select value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className={inputCls}>
                    <option>Female</option><option>Male</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Ward Unit</label>
                  <select value={newPatient.ward}
                    onChange={(e) => setNewPatient({ ...newPatient, ward: e.target.value })}
                    className={inputCls}>
                    <option value="ICU">ICU</option>
                    <option value="CARDIOLOGY">CARDIOLOGY</option>
                    <option value="PULMONOLOGY">PULMONOLOGY</option>
                    <option value="NEUROLOGY">NEUROLOGY</option>
                    <option value="GENERAL WARD">GENERAL WARD</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Room Number</label>
                  <input type="text" value={newPatient.roomNumber}
                    onChange={(e) => setNewPatient({ ...newPatient, roomNumber: e.target.value })}
                    placeholder="ICU-108" className={inputCls} />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[rgba(30,41,59,0.80)] text-slate-300 text-xs font-semibold hover:bg-slate-700 border border-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-glow-blue hover:from-blue-500 hover:to-indigo-500 transition-all">
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
