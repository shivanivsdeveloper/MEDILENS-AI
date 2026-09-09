import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Eye, Search, Activity, FileText } from 'lucide-react';
import { api } from '../api/client';
import { PatientItem } from '../types';
import { Language, translations } from '../i18n/translations';

export const PatientsPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refId, setRefId] = useState(`PT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [pseudonym, setPseudonym] = useState('');
  const [age, setAge] = useState<number>(45);
  const [sex, setSex] = useState('Male');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await api.listPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPatient({
        reference_id: refId,
        pseudonym: pseudonym || undefined,
        age: age || undefined,
        sex: sex || undefined,
        notes: notes || undefined
      });
      setShowAddModal(false);
      setPseudonym('');
      setNotes('');
      setRefId(`PT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      loadPatients();
    } catch (err: any) {
      alert(`Failed to create patient: ${err.message}`);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.reference_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.pseudonym && p.pseudonym.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-telemetry-cyan" />
            <span>{t.nav_patients}</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Privacy-preserving longitudinal patient directory and radiographic screening history.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-coherent-blue to-telemetry-cyan text-matrix-black font-semibold rounded-xl text-xs font-mono flex items-center gap-2 shadow-glow-cyan"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Patient</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Patient Reference ID or Pseudonym..."
          className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none transition-colors"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredPatients.map((p) => (
          <div key={p.id} className="p-5 rounded-xl spatial-glass border border-surface-border flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-telemetry-cyan">{p.reference_id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-card text-slate-400">
                  {p.scans_count || 0} scans
                </span>
              </div>
              <div className="text-base font-semibold text-slate-100">{p.pseudonym || 'Anonymous Profile'}</div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                {p.age ? `${p.age} years` : 'Age N/A'} | {p.sex || 'Sex N/A'}
              </div>
              {p.notes && (
                <p className="text-[11px] font-mono text-slate-400 mt-2 line-clamp-2 bg-surface-panel p-2 rounded border border-surface-border/50">
                  {p.notes}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                Created: {p.created_at.slice(0, 10)}
              </span>
              <Link
                to={`/patients/${p.id}`}
                className="px-3 py-1.5 rounded-lg bg-coherent-blue/15 hover:bg-coherent-blue/25 text-coherent-blue border border-coherent-blue/30 text-xs font-mono flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-matrix-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-clinical-dark border border-coherent-blue/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-glow-cyan">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-telemetry-cyan" />
              <span>Register Patient Profile</span>
            </h2>

            <form onSubmit={handleCreatePatient} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Reference ID</label>
                <input
                  type="text"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Pseudonym / Initials (Optional)</label>
                <input
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="e.g. John Doe / PT-01"
                  className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Clinical Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100"
                  placeholder="Medical indication, symptoms, prior history..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-card text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-coherent-blue to-telemetry-cyan text-matrix-black font-bold rounded-lg"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
