import React, { useState, useEffect } from 'react';
import { PatientService } from '../services/api';
import { Patient } from '../types';
import { PatientListTable } from '../components/dashboard/PatientListTable';
import { Search, Filter, Plus, UserPlus, SlidersHorizontal } from 'lucide-react';

export const PatientRosterPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [minRisk, setMinRisk] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State for Adding Patient
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Female',
    bloodType: 'O+',
    roomNumber: 'ICU-105',
    ward: 'ICU',
    phone: '',
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

  useEffect(() => {
    fetchPatients();
  }, [searchQuery, selectedWard, minRisk]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PatientService.createPatient({
        ...newPatient,
        age: Number(newPatient.age),
      });
      setShowAddModal(false);
      setNewPatient({ name: '', age: '', gender: 'Female', bloodType: 'O+', roomNumber: 'ICU-105', ward: 'ICU', phone: '' });
      fetchPatients();
    } catch (err) {
      console.error('Failed to create patient:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-wide">
            Patient Directory & Triage Roster
          </h1>
          <p className="text-xs text-slate-400">
            Search, filter, and review active hospital patient telemetry records
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-clinical-teal to-clinical-cyan text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-glow-teal hover:opacity-90 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, room..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-clinical-teal"
            />
          </div>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-clinical-teal font-semibold"
          >
            <option value="ALL">All Clinical Wards</option>
            <option value="ICU">ICU Unit</option>
            <option value="CARDIOLOGY">Cardiology</option>
            <option value="PULMONOLOGY">Pulmonology</option>
            <option value="NEUROLOGY">Neurology</option>
            <option value="GENERAL WARD">General Ward</option>
          </select>
        </div>

        {/* Min Risk Score Threshold Slider */}
        <div className="flex items-center space-x-3 w-full lg:w-auto text-xs">
          <SlidersHorizontal className="w-4 h-4 text-clinical-teal" />
          <span className="text-slate-400 font-semibold">Min Risk Threshold:</span>
          <input
            type="range"
            min="0"
            max="80"
            step="10"
            value={minRisk}
            onChange={(e) => setMinRisk(Number(e.target.value))}
            className="w-28 accent-clinical-teal cursor-pointer"
          />
          <span className="font-mono font-bold text-clinical-teal px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            {minRisk}+
          </span>
        </div>
      </div>

      {/* Patient Table */}
      <PatientListTable patients={patients} isLoading={isLoading} />

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Register New Telemetry Patient</h3>

            <form onSubmit={handleCreatePatient} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  placeholder="e.g. David Ross"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Age</label>
                  <input
                    type="number"
                    required
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="58"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Ward Unit</label>
                  <select
                    value={newPatient.ward}
                    onChange={(e) => setNewPatient({ ...newPatient, ward: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                  >
                    <option value="ICU">ICU</option>
                    <option value="CARDIOLOGY">CARDIOLOGY</option>
                    <option value="PULMONOLOGY">PULMONOLOGY</option>
                    <option value="NEUROLOGY">NEUROLOGY</option>
                    <option value="GENERAL WARD">GENERAL WARD</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Room Number</label>
                  <input
                    type="text"
                    value={newPatient.roomNumber}
                    onChange={(e) => setNewPatient({ ...newPatient, roomNumber: e.target.value })}
                    placeholder="ICU-108"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-clinical-teal"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-clinical-teal hover:bg-teal-600 text-slate-950 text-xs font-bold"
                >
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
