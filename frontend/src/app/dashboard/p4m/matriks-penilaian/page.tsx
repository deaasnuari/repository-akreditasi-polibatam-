'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Download, Save, RotateCcw, Trophy, Loader2, Plus, Trash2, Eye, X } from 'lucide-react';

type UserRole = 'TU' | 'Tim Akreditasi' | 'P4M';
type AccreditationGrade = 'A' | 'B' | 'C' | 'Tidak Terakreditasi';

interface Criterion {
  id: number;
  kriteria_id?: number;
  kode: string;
  kriteria: string;
  bobot: number;
  skor_maksimal: number;
  skorInput: number;
  skorTerbobot: number;
  description: string;
  urutan: number;
}

interface SavedScenario {
  nama_skenario: string;
  created_at: string;
  jumlah_kriteria: number;
  total_skor: number;
}

export default function MatriksPenilaianPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('Tim Akreditasi');

  const API_BASE = 'http://localhost:5000/api/matriks-penilaian';
  const canEdit = userRole === 'Tim Akreditasi';

  useEffect(() => {
    fetchKriteria();
    fetchSavedScenarios();
  }, []);

  const fetchKriteria = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/kriteria`);
      const json = await res.json();

      if (json.success) {
        const mappedData = json.data.map((item: any) => ({
          id: item.id,
          kriteria_id: item.id,
          kode: item.kode,
          kriteria: item.kriteria,
          bobot: parseFloat(item.bobot),
          skor_maksimal: parseFloat(item.skor_maksimal),
          skorInput: 0,
          skorTerbobot: 0,
          description: item.description || '',
          urutan: item.urutan
        }));
        setCriteria(mappedData);
      }
    } catch (err: any) {
      console.error('Fetch kriteria error:', err);
      alert('Gagal memuat data kriteria');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedScenarios = async () => {
    try {
      const res = await fetch(`${API_BASE}/skenario`);
      const json = await res.json();
      if (json.success) {
        setSavedScenarios(json.data);
      }
    } catch (err: any) {
      console.error('Fetch scenarios error:', err);
    }
  };

  const calculateTotalScore = () => {
    return criteria.reduce((total, criterion) => total + criterion.skorTerbobot, 0);
  };

  const getAccreditationGrade = (score: number): AccreditationGrade => {
    if (score >= 3.51) return 'A';
    if (score >= 3.01) return 'B';
    if (score >= 2.01) return 'C';
    return 'Tidak Terakreditasi';
  };

  const getGradeBadge = (grade: AccreditationGrade) => {
    const colors = {
      'A': 'bg-green-100 text-green-800 border-green-300',
      'B': 'bg-blue-100 text-blue-800 border-blue-300',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Tidak Terakreditasi': 'bg-gray-100 text-gray-700 border-gray-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[grade]}`}>
        {grade}
      </span>
    );
  };

  const handleScoreChange = (id: number, newScore: number) => {
    if (!canEdit) return;

    setCriteria(prev => prev.map(criterion => {
      if (criterion.id === id) {
        const validScore = Math.max(0, Math.min(newScore, criterion.skor_maksimal));
        const skorTerbobot = validScore * criterion.bobot;
        return {
          ...criterion,
          skorInput: validScore,
          skorTerbobot: parseFloat(skorTerbobot.toFixed(3))
        };
      }
      return criterion;
    }));
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      alert('Nama skenario tidak boleh kosong');
      return;
    }

    try {
      setSaving(true);

      const dataPenilaian = criteria.map(c => ({
        kriteria_id: c.kriteria_id || c.id,
        skor_input: c.skorInput,
        skor_terbobot: c.skorTerbobot,
        catatan: null
      }));

      const res = await fetch(`${API_BASE}/skenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_skenario: scenarioName,
          data_penilaian: dataPenilaian
        })
      });

      const json = await res.json();

      if (json.success) {
        alert(json.message);
        setShowSaveDialog(false);
        setScenarioName('');
        await fetchSavedScenarios();
      } else {
        alert(json.message || 'Gagal menyimpan skenario');
      }
    } catch (err: any) {
      console.error('Save scenario error:', err);
      alert('Gagal menyimpan skenario');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadScenario = async (nama_skenario: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/skenario/${encodeURIComponent(nama_skenario)}`);
      const json = await res.json();

      if (json.success) {
        const loadedData = json.data;
        
        setCriteria(prev => prev.map(criterion => {
          const found = loadedData.find((d: any) => d.kriteria_id === criterion.id);
          if (found) {
            return {
              ...criterion,
              skorInput: parseFloat(found.skor_input),
              skorTerbobot: parseFloat(found.skor_terbobot)
            };
          }
          return criterion;
        }));

        alert(`Skenario "${nama_skenario}" berhasil dimuat`);
      }
    } catch (err: any) {
      console.error('Load scenario error:', err);
      alert('Gagal memuat skenario');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScenario = async (nama_skenario: string) => {
    if (!confirm(`Hapus skenario "${nama_skenario}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/skenario/${encodeURIComponent(nama_skenario)}`, {
        method: 'DELETE'
      });
      const json = await res.json();

      if (json.success) {
        alert(json.message);
        await fetchSavedScenarios();
      } else {
        alert(json.message || 'Gagal menghapus skenario');
      }
    } catch (err: any) {
      console.error('Delete scenario error:', err);
      alert('Gagal menghapus skenario');
    }
  };

  const handleReset = () => {
    if (!confirm('Reset semua skor ke 0?')) return;
    
    setCriteria(prev => prev.map(criterion => ({
      ...criterion,
      skorInput: 0,
      skorTerbobot: 0
    })));
    alert('Semua skor direset');
  };

  const totalScore = calculateTotalScore();
  const grade = getAccreditationGrade(totalScore);
  const progressPercentage = (totalScore / 4) * 100;

  if (loading && criteria.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Calculator className="text-blue-900" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Matriks Penilaian Akreditasi</h1>
              <p className="text-sm text-gray-600">Simulasi penilaian akreditasi berdasarkan kriteria BAN-PT</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        {/* Role Notice */}
        {userRole === 'P4M' && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Mode Review:</strong> Anda dapat melihat simulasi matriks penilaian dalam mode read-only.
            </p>
          </div>
        )}

        {userRole === 'TU' && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Akses Terbatas:</strong> Tim TU dapat melihat hasil simulasi namun tidak dapat mengedit.
            </p>
          </div>
        )}

        {userRole === 'Tim Akreditasi' && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <p className="text-green-800 text-sm">
              <strong>Mode Simulasi:</strong> Anda dapat melakukan simulasi penilaian dan membuat berbagai skenario.
            </p>
          </div>
        )}

        {/* Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-800">Hasil Simulasi Akreditasi</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Skor Total</p>
                  <p className="text-4xl font-bold text-gray-900">{totalScore.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Peringkat</p>
                  {getGradeBadge(grade)}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="text-center">
                  <div className="h-2 bg-gray-300 rounded mb-1"></div>
                  <span className="text-xs text-gray-600">Tidak Terakreditasi</span>
                </div>
                <div className="text-center">
                  <div className="h-2 bg-yellow-300 rounded mb-1"></div>
                  <span className="text-xs text-gray-600">C (2.01-3.00)</span>
                </div>
                <div className="text-center">
                  <div className="h-2 bg-blue-300 rounded mb-1"></div>
                  <span className="text-xs text-gray-600">B (3.01-3.50)</span>
                </div>
                <div className="text-center">
                  <div className="h-2 bg-green-300 rounded mb-1"></div>
                  <span className="text-xs text-gray-600">A (3.51-4.00)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {canEdit && (
                <>
                  <button 
                    onClick={() => setShowSaveDialog(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    <Save size={16} /> Simpan Skenario
                  </button>
                  <button 
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    <RotateCcw size={16} /> Reset Semua
                  </button>
                </>
              )}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                <Download size={16} /> Export Hasil
              </button>
            </div>
          </div>
        </div>

        {/* Saved Scenarios */}
        {savedScenarios.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Skenario Tersimpan ({savedScenarios.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedScenarios.map((scenario) => {
                const scenarioGrade = getAccreditationGrade(parseFloat(scenario.total_skor));

                return (
                  <div 
                    key={scenario.nama_skenario} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-800">{scenario.nama_skenario}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(scenario.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-sm font-medium text-gray-700 mt-1">
                          Skor: {parseFloat(scenario.total_skor).toFixed(2)}
                        </p>
                      </div>
                      {getGradeBadge(scenarioGrade)}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleLoadScenario(scenario.nama_skenario)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs text-gray-700"
                      >
                        <Eye size={14} /> Load
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteScenario(scenario.nama_skenario)}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Matrix Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Matriks Penilaian
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 border-b">Kode</th>
                  <th className="px-4 py-3 border-b">Kriteria</th>
                  <th className="px-4 py-3 border-b text-center">Bobot</th>
                  <th className="px-4 py-3 border-b text-center">Skor Maks</th>
                  <th className="px-4 py-3 border-b text-center">Skor Input</th>
                  <th className="px-4 py-3 border-b text-center">Skor Terbobot</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((criterion) => (
                  <tr key={criterion.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b font-medium text-gray-700">{criterion.kode}</td>
                    <td className="px-4 py-3 border-b">
                      <p className="font-medium text-gray-800 text-sm">{criterion.kriteria}</p>
                      <p className="text-xs text-gray-500 mt-1">{criterion.description}</p>
                    </td>
                    <td className="px-4 py-3 border-b text-center text-gray-700">
                      {(criterion.bobot * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 border-b text-center text-gray-700">
                      {criterion.skor_maksimal}
                    </td>
                    <td className="px-4 py-3 border-b text-center">
                      <input
                        type="number"
                        min="0"
                        max={criterion.skor_maksimal}
                        step="0.1"
                        value={criterion.skorInput || ''}
                        onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!canEdit}
                      />
                    </td>
                    <td className="px-4 py-3 border-b text-center">
                      <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-semibold text-gray-700">
                        {criterion.skorTerbobot.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={5} className="px-4 py-4 text-right text-gray-800">
                    Total Skor Akreditasi:
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-4 py-2 bg-blue-600 text-white rounded text-base font-bold">
                      {totalScore.toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Analisis Skor & Rekomendasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3 text-sm">Kontribusi per Kriteria</h4>
              <div className="space-y-2">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 w-12">{criterion.kode}</span>
                    <div className="flex items-center space-x-2 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${(criterion.skorTerbobot / (criterion.bobot * 4)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-12 text-right text-gray-700">
                        {criterion.skorTerbobot.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 text-sm">Prioritas Perbaikan</h4>
              <div className="space-y-2">
                {criteria
                  .filter(c => (c.skorInput / c.skor_maksimal) < 0.75)
                  .sort((a, b) => (a.skorInput / a.skor_maksimal) - (b.skorInput / b.skor_maksimal))
                  .slice(0, 3)
                  .map((criterion) => (
                    <div 
                      key={criterion.id} 
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        <strong>{criterion.kode}:</strong> {criterion.kriteria}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Skor: {criterion.skorInput.toFixed(1)}/{criterion.skor_maksimal}
                        {' '}({((criterion.skorInput / criterion.skor_maksimal) * 100).toFixed(0)}%)
                      </p>
                    </div>
                  ))}
                {criteria.filter(c => (c.skorInput / c.skor_maksimal) < 0.75).length === 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-sm text-green-800">
                      ✅ Semua kriteria sudah mencapai standar baik!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Simpan Skenario Baru</h3>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setScenarioName('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Skenario
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="Contoh: Skenario Optimis 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setScenarioName('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveScenario}
                  disabled={saving || !scenarioName.trim()}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}