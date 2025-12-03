'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Download, Save, RotateCcw, Trophy, Loader2, Eye, X, Trash2 } from 'lucide-react';
import { matriksPenilaianService, type Criterion, type Scenario } from '@/services/matriksPenilaianService';

type AccreditationGrade = 'A' | 'B' | 'C' | 'Tidak Terakreditasi';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  nama_lengkap: string;
};

export default function MatriksPenilaianPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const canEdit = user?.role === 'tim-akreditasi';

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchAndSetCriteria = async () => {
      try {
        setLoading(true);
        const fetchedCriteria = await matriksPenilaianService.fetchKriteria();
        const initializedCriteria = fetchedCriteria.map(c => ({
          ...c,
          skorInput: c.skorInput || 0,
          skorTerbobot: c.skorTerbobot || 0,
        }));
        setCriteria(initializedCriteria);
      } catch (error) {
        console.error('Failed to fetch criteria:', error);
        // Optionally, set some error state to show in the UI
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetCriteria();
  }, []);

  const calculateTotalScore = () => {
    return matriksPenilaianService.calculateTotalScore(criteria);
  };

  const getAccreditationGrade = (score: number): AccreditationGrade => {
    return matriksPenilaianService.getAccreditationGrade(score) as AccreditationGrade;
  };

  const handleSelectScore = async (id: number, val: number) => {
    if (!canEdit || !user) return;

    const originalCriteria = [...criteria];
    
    setCriteria(prev => prev.map(c => {
      if (c.id === id) {
        const skor = Math.max(1, Math.min(val, 4)); // ensure 1..4
        const terbobot = matriksPenilaianService.calculateSkorTerbobot(skor, c.bobot);
        return { ...c, skorInput: skor, skorTerbobot: terbobot };
      }
      return c;
    }));

    try {
      await matriksPenilaianService.saveScore({
        prodi_id: user.id,
        criteria_item_id: id,
        skor_prodi: val,
      });
    } catch (error) {
      console.error('Failed to save score:', error);
      alert('Gagal menyimpan skor ke server. Periksa koneksi atau hubungi administrator. Perubahan Anda telah dibatalkan.');
      setCriteria(originalCriteria); // Revert to original state on error
    }
  };

  const totalScore = calculateTotalScore();
  const grade = getAccreditationGrade(totalScore);
  const progressPercentage = (totalScore / 4) * 100;

  // New grouping logic that preserves order and handles A/B criteria
  const groupDefinitions = [
    { key: 'A', name: 'A. Kondisi Eksternal' },
    { key: 'B', name: 'B. Profil Unit Pengelola Program Studi' },
    { key: '1', name: 'Kriteria 1: Budaya Mutu' },
    { key: '2', name: 'Kriteria 2: Relevansi Pendidikan' },
    { key: '3', name: 'Kriteria 3: Relevansi Penelitian' },
    { key: '4', name: 'Kriteria 4: Relevansi PkM' },
    { key: '5', name: 'Kriteria 5: Akuntabilitas' },
    { key: '6', name: 'Kriteria 6: Diferensiasi Misi' },
  ];

  const groupedAndOrderedCriteria = groupDefinitions.map(group => {
    const items = criteria.filter(c => {
      // Group by '1.' for Kriteria 1, etc.
      if (!isNaN(parseInt(group.key))) {
        return c.no_butir?.startsWith(`${group.key}.`);
      }
      // Group by exact match for 'A', 'B'
      return c.no_butir === group.key;
    });
    return { ...group, items };
  }).filter(group => group.items.length > 0);


  if (loading && criteria.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <main className="w-full p-4 md:p-6 max-w-full">
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="text-blue-900" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Matriks Penilaian LAM</h1>
              <p className="text-sm text-gray-600">Tabel rubrik LAM — isi hanya kolom <strong>Skor Prodi</strong>.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
              <Download size={16} /> Export PDF
            </button>
            {canEdit && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm"
              >
                <Save size={14} /> Simpan Skenario
              </button>
            )}
          </div>
        </div>

        {/* Ringkasan skor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-800">Hasil Penilaian</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skor Total</p>
                <p className="text-4xl font-bold text-gray-900">{totalScore.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Peringkat</p>
                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-300">
                  {grade}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
              <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {canEdit && (
                <button onClick={() => {
                  // reset
                  if (!confirm('Reset semua skor?')) return;
                  setCriteria(prev => prev.map(c => ({ ...c, skorInput: 0, skorTerbobot: 0 })));
                }} className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                  <RotateCcw size={14} /> Reset Semua
                </button>
              )}
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                <Download size={14} /> Export Hasil
              </button>
            </div>
          </div>
        </div>

        {/* Matriks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center"><Calculator className="w-5 h-5 mr-2" /> Matriks Penilaian</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 border-b">Jenis</th>
                  <th className="px-3 py-2 border-b">No. Urut</th>
                  <th className="px-3 py-2 border-b">No. Butir</th>
                  <th className="px-3 py-2 border-b text-center">Bobot</th>
                  <th className="px-3 py-2 border-b">Elemen Penilaian LAM</th>
                  <th className="px-3 py-2 border-b">Deskriptor</th>
                  <th className="px-3 py-2 border-b text-center">Sangat Baik (4)</th>
                  <th className="px-3 py-2 border-b text-center">Baik (3)</th>
                  <th className="px-3 py-2 border-b text-center">Cukup (2)</th>
                  <th className="px-3 py-2 border-b text-center">Kurang (1)</th>
                  <th className="px-3 py-2 border-b text-center">Skor Prodi</th>
                </tr>
              </thead>

              <tbody>
                {groupedAndOrderedCriteria.map(group => (
                  <React.Fragment key={group.key}>
                    <tr className="bg-gray-200 sticky top-0 z-10">
                      <th colSpan={11} className="px-3 py-2 text-left text-sm font-bold text-gray-800">
                        {group.name}
                      </th>
                    </tr>
                    {group.items.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 align-top">
                        <td className="px-3 py-3 border-b">{c.jenis ?? '-'}</td>
                        <td className="px-3 py-3 border-b">{c.no_urut ?? c.urutan ?? '-'}</td>
                        <td className="px-3 py-3 border-b">{c.no_butir ?? c.kode ?? '-'}</td>
                        <td className="px-3 py-3 border-b text-center">
                          {/* show as percent if bobot <=1 */}
                          {c.bobot <= 1 ? `${(c.bobot * 100).toFixed(0)}%` : c.bobot}
                        </td>

                        <td className="px-3 py-3 border-b w-72">
                          <p className="font-medium text-gray-800">{c.kriteria}</p>
                          {c.urutan && <p className="text-xs text-gray-500 mt-1">Urutan: {c.urutan}</p>}
                        </td>

                        <td className="px-3 py-3 border-b text-xs text-gray-600 w-48">
                          {c.deskriptor || '-'}
                        </td>

                        {/* descriptors per level (hoverable/scrollable) */}
                        <td className="px-3 py-3 border-b text-xs text-gray-700 max-w-xs">
                          <div className="text-xs mb-1">{c.descriptor_4 ?? ''}</div>
                          <div className="text-right">
                            <label className={`inline-flex items-center gap-1`}>
                              <input
                                type="radio"
                                name={`score-${c.id}`}
                                value="4"
                                checked={c.skorInput === 4}
                                onChange={() => handleSelectScore(c.id, 4)}
                                disabled={!canEdit}
                                className="form-radio"
                              />
                              <span className="ml-1 text-sm font-semibold">4</span>
                            </label>
                          </div>
                        </td>

                        <td className="px-3 py-3 border-b text-xs text-gray-700 max-w-xs">
                          <div className="text-xs mb-1">{c.descriptor_3 ?? ''}</div>
                          <div className="text-right">
                            <label className={`inline-flex items-center gap-1`}>
                              <input
                                type="radio"
                                name={`score-${c.id}`}
                                value="3"
                                checked={c.skorInput === 3}
                                onChange={() => handleSelectScore(c.id, 3)}
                                disabled={!canEdit}
                                className="form-radio"
                              />
                              <span className="ml-1 text-sm font-semibold">3</span>
                            </label>
                          </div>
                        </td>

                        <td className="px-3 py-3 border-b text-xs text-gray-700 max-w-xs">
                          <div className="text-xs mb-1">{c.descriptor_2 ?? ''}</div>
                          <div className="text-right">
                            <label className={`inline-flex items-center gap-1`}>
                              <input
                                type="radio"
                                name={`score-${c.id}`}
                                value="2"
                                checked={c.skorInput === 2}
                                onChange={() => handleSelectScore(c.id, 2)}
                                disabled={!canEdit}
                                className="form-radio"
                              />
                              <span className="ml-1 text-sm font-semibold">2</span>
                            </label>
                          </div>
                        </td>

                        <td className="px-3 py-3 border-b text-xs text-gray-700 max-w-xs">
                          <div className="text-xs mb-1">{c.descriptor_1 ?? ''}</div>
                          <div className="text-right">
                            <label className={`inline-flex items-center gap-1`}>
                              <input
                                type="radio"
                                name={`score-${c.id}`}
                                value="1"
                                checked={c.skorInput === 1}
                                onChange={() => handleSelectScore(c.id, 1)}
                                disabled={!canEdit}
                                className="form-radio"
                              />
                              <span className="ml-1 text-sm font-semibold">1</span>
                            </label>
                          </div>
                        </td>

                        <td className="px-3 py-3 border-b text-center">
                          <div className="text-sm font-semibold">
                            {c.skorInput ? c.skorInput : '-'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Terbobot: <span className="font-medium">{c.skorTerbobot.toFixed(3)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}

                <tr className="bg-gray-50 font-bold">
                  <td colSpan={10} className="px-4 py-4 text-right text-gray-800">
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

        {/* Prioritas perbaikan (sama seperti sebelumnya) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Prioritas Perbaikan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criteria
              .filter(c => (c.skorInput / (c.skor_maksimal || 4)) < 0.75)
              .sort((a, b) => (a.skorInput / (a.skor_maksimal || 4)) - (b.skorInput / (b.skor_maksimal || 4)))
              .slice(0, 6)
              .map(c => (
                <div key={c.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-800"><strong>{c.no_butir || c.kode}:</strong> {c.kriteria}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Skor: {c.skorInput || 0}/{c.skor_maksimal || 4} ({(((c.skorInput || 0) / (c.skor_maksimal || 4)) * 100).toFixed(0)}%)
                  </p>
                </div>
              ))
            }
            {criteria.filter(c => (c.skorInput / (c.skor_maksimal || 4)) < 0.75).length === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center md:col-span-3">
                <p className="text-sm text-green-800">✅ Semua kriteria sudah mencapai standar baik!</p>
              </div>
            )}
          </div>
        </div>

        {/* Save dialog (opsional, seperti sebelumnya) */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Simpan Skenario</h3>
                <button onClick={() => setShowSaveDialog(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Skenario</label>
                <input type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 border border-gray-300 rounded">Batal</button>
                <button disabled={saving || !scenarioName.trim()} onClick={() => {
                  // implement save call to backend if needed
                  alert('Implementasi save ke backend (frontend sudah siap).');
                }} className="px-4 py-2 bg-blue-700 text-white rounded disabled:opacity-50">Simpan</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
