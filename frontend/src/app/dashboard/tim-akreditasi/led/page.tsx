'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash, Save, Info } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  fetchBudayaMutuLED,
  createBudayaMutuLED,
  updateBudayaMutuLED,
  saveDraftBudayaMutuLED,
  loadDraftBudayaMutuLED,
} from '@/services/budayaMutuService';

type Row2Col = { id: string; pernyataan: string; keterlaksanaan: string };
type RowEval = {
  id: string;
  pernyataan: string;
  keterlaksanaan: string;
  evaluasi: string;
  tindak_lanjut: string;
  hasil_optimalisasi: string;
};

type TabData = {
  penetapanA: Row2Col[];
  penetapanB: Row2Col[];
  pelaksanaanA: Row2Col[];
  pelaksanaanB: Row2Col[];
  evalRows: RowEval[];
};

const uid = (p = '') => p + Math.random().toString(36).substring(2, 9);

const tabs = [
  ['budaya-mutu', 'C.1 Budaya Mutu'],
  ['relevansi-pendidikan', 'C.2 Relevansi Pendidikan'],
  ['relevansi-penelitian', 'C.3 Relevansi Penelitian'],
  ['relevansi-pkm', 'C.4 Relevansi PkM'],
  ['akuntabilitas', 'C.5 Akuntabilitas'],
  ['diferensiasi-misi', 'C.6 Diferensiasi Misi'],
];

const createEmptyTab = (): TabData => ({
  penetapanA: [{ id: uid('pa-'), pernyataan: '', keterlaksanaan: '' }],
  penetapanB: [{ id: uid('pb-'), pernyataan: '', keterlaksanaan: '' }],
  pelaksanaanA: [{ id: uid('la-'), pernyataan: '', keterlaksanaan: '' }],
  pelaksanaanB: [{ id: uid('lb-'), pernyataan: '', keterlaksanaan: '' }],
  evalRows: [
    {
      id: uid('ev-'),
      pernyataan: '',
      keterlaksanaan: '',
      evaluasi: '',
      tindak_lanjut: '',
      hasil_optimalisasi: '',
    },
  ],
});

export default function BudayaMutuLEDPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('budaya-mutu');
  const [loading, setLoading] = useState(true);
  const [serverId, setServerId] = useState<string | null>(null);
  const [tabData, setTabData] = useState<Record<string, TabData>>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      try {
        const apiData = await fetchBudayaMutuLED();
        if (apiData?.length) {
          const latest = apiData[0];
          setServerId(latest._id);
          
          // Pastikan setiap tab memiliki data yang valid
          const validatedTabs: Record<string, TabData> = {};
          tabs.forEach(([key]) => {
            if (latest.tabs && latest.tabs[key]) {
              validatedTabs[key] = {
                penetapanA: Array.isArray(latest.tabs[key].penetapanA) && latest.tabs[key].penetapanA.length > 0 
                  ? latest.tabs[key].penetapanA 
                  : [{ id: uid('pa-'), pernyataan: '', keterlaksanaan: '' }],
                penetapanB: Array.isArray(latest.tabs[key].penetapanB) && latest.tabs[key].penetapanB.length > 0
                  ? latest.tabs[key].penetapanB
                  : [{ id: uid('pb-'), pernyataan: '', keterlaksanaan: '' }],
                pelaksanaanA: Array.isArray(latest.tabs[key].pelaksanaanA) && latest.tabs[key].pelaksanaanA.length > 0
                  ? latest.tabs[key].pelaksanaanA
                  : [{ id: uid('la-'), pernyataan: '', keterlaksanaan: '' }],
                pelaksanaanB: Array.isArray(latest.tabs[key].pelaksanaanB) && latest.tabs[key].pelaksanaanB.length > 0
                  ? latest.tabs[key].pelaksanaanB
                  : [{ id: uid('lb-'), pernyataan: '', keterlaksanaan: '' }],
                evalRows: Array.isArray(latest.tabs[key].evalRows) && latest.tabs[key].evalRows.length > 0
                  ? latest.tabs[key].evalRows
                  : [{ id: uid('ev-'), pernyataan: '', keterlaksanaan: '', evaluasi: '', tindak_lanjut: '', hasil_optimalisasi: '' }],
              };
            } else {
              validatedTabs[key] = createEmptyTab();
            }
          });
          setTabData(validatedTabs);
        } else {
          const draft = loadDraftBudayaMutuLED();
          if (draft?.tabs) {
            setTabData(draft.tabs);
          } else {
            const initialTabs: Record<string, TabData> = {};
            tabs.forEach(([key]) => {
              initialTabs[key] = createEmptyTab();
            });
            setTabData(initialTabs);
          }
        }
      } catch (err) {
        console.error('Gagal memuat data:', err);
        toast.error('Gagal memuat data dari server');
        const initialTabs: Record<string, TabData> = {};
        tabs.forEach(([key]) => {
          initialTabs[key] = createEmptyTab();
        });
        setTabData(initialTabs);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isClient]);

  const handleSave = useCallback(async (notify = true, auto = false) => {
    try {
      saveDraftBudayaMutuLED({ tabs: tabData });

      if (serverId) {
        await updateBudayaMutuLED(serverId, { tabs: tabData });
      } else {
        const res = await createBudayaMutuLED({ tabs: tabData });
        if (res?.data?._id) {
          setServerId(res.data._id);
        }
      }

      if (notify && !auto) {
        toast.success('✅ Data Budaya Mutu berhasil disimpan ke server!');
      }
    } catch (error) {
      console.error('Error saving:', error);
      if (notify) {
        toast.warning('💾 Disimpan ke draft (offline mode). Server tidak merespons.');
      }
    }
  }, [tabData, serverId]);

  useEffect(() => {
    if (!isClient || loading) return;
    const interval = setInterval(() => {
      handleSave(false, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [isClient, loading, handleSave]);

  const handleAddRow = useCallback((sectionKey: keyof TabData, template: any) => {
    setTabData((prev) => {
      const currentTab = prev[activeTab] || createEmptyTab();
      const currentSection = currentTab[sectionKey] || [];
      
      const newRow = { 
        ...template, 
        id: uid(sectionKey.substring(0, 2) + '-')
      };
      
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          [sectionKey]: [...currentSection, newRow],
        },
      };
    });
  }, [activeTab]);

  const handleRemoveRow = useCallback((sectionKey: keyof TabData, id: string) => {
    setTabData((prev) => {
      const currentTab = prev[activeTab] || createEmptyTab();
      const currentSection = currentTab[sectionKey] || [];
      
      if (currentSection.length <= 1) {
        toast.warning('Minimal harus ada 1 baris data');
        return prev;
      }
      
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          [sectionKey]: currentSection.filter((r: any) => r.id !== id),
        },
      };
    });
  }, [activeTab]);

  const handleUpdateRow = useCallback((sectionKey: keyof TabData, id: string, field: string, value: string) => {
    setTabData((prev) => {
      const currentTab = prev[activeTab] || createEmptyTab();
      const currentSection = currentTab[sectionKey] || [];
      
      return {
        ...prev,
        [activeTab]: {
          ...currentTab,
          [sectionKey]: currentSection.map((r: any) => 
            r.id === id ? { ...r, [field]: value } : r
          ),
        },
      };
    });
  }, [activeTab]);

  if (!isClient) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#183A64] font-semibold text-lg">
        Memuat data Budaya Mutu...
      </div>
    );
  }

  const currentTabData = tabData[activeTab] || createEmptyTab();

  return (
    <div className="min-h-screen bg-white p-6">
      <Toaster position="top-right" richColors />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#183A64] to-[#2C5F8D] text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold">Budaya Mutu LED</h1>
          <p className="text-sm mt-2 opacity-90">
            Kelola data budaya mutu untuk berbagai aspek standar pendidikan tinggi
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-gray-100 p-2 rounded-lg shadow-sm">
          {tabs.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setActiveTab(val)}
              className={`text-xs md:text-sm py-2.5 px-2 rounded-lg border transition-all duration-200 font-medium ${
                activeTab === val
                  ? 'bg-[#183A64] text-white border-[#183A64] shadow-md scale-105'
                  : 'bg-white border-gray-300 text-[#183A64] hover:bg-[#ADE7F7] hover:border-[#183A64]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl text-[#183A64] font-semibold border-b-4 border-[#183A64] pb-2 mb-4">
            {tabs.find(([key]) => key === activeTab)?.[1]}
          </h2>

          <div className="flex items-start gap-3 bg-[#ADE7F7]/40 border-l-4 border-[#183A64] p-4 rounded-lg mb-6">
            <Info className="h-5 w-5 text-[#183A64] mt-1 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Panduan Pengisian:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Lengkapi tabel dengan pernyataan standar dan keterlaksanaannya</li>
                <li>Gunakan tombol <strong>Tambah Baris</strong> untuk menambah data baru</li>
                <li>Gunakan tombol <strong>Hapus</strong> untuk menghapus baris (minimal 1 baris)</li>
                <li>Data akan otomatis tersimpan setiap 30 detik</li>
              </ul>
            </div>
          </div>

          {/* Penetapan Section */}
          <div className="mb-8">
            <h3 className="font-semibold text-[#183A64] text-lg mb-3 flex items-center gap-2">
              <span className="bg-[#183A64] text-white px-3 py-1 rounded">1</span>
              Penetapan
            </h3>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel A</h4>
              <Table2Col
                rows={currentTabData.penetapanA}
                sectionKey="penetapanA"
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel B</h4>
              <Table2Col
                rows={currentTabData.penetapanB}
                sectionKey="penetapanB"
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
              />
            </div>
          </div>

          {/* Pelaksanaan Section */}
          <div className="mb-8">
            <h3 className="font-semibold text-[#183A64] text-lg mb-3 flex items-center gap-2">
              <span className="bg-[#183A64] text-white px-3 py-1 rounded">2</span>
              Pelaksanaan
            </h3>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel A</h4>
              <Table2Col
                rows={currentTabData.pelaksanaanA}
                sectionKey="pelaksanaanA"
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel B</h4>
              <Table2Col
                rows={currentTabData.pelaksanaanB}
                sectionKey="pelaksanaanB"
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
              />
            </div>
          </div>

          {/* Evaluasi Section */}
          <SectionEval
            evalRows={currentTabData.evalRows}
            onAdd={handleAddRow}
            onRemove={handleRemoveRow}
            onUpdate={handleUpdateRow}
          />

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => handleSave(true, false)}
              className="inline-flex items-center gap-2 bg-[#183A64] text-white px-6 py-3 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <Save className="h-5 w-5" />
              💾 Simpan Data ke Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================== SUB KOMPONEN =================== */

interface Table2ColProps {
  rows: Row2Col[];
  sectionKey: keyof TabData;
  onAdd: (sectionKey: keyof TabData, template: any) => void;
  onRemove: (sectionKey: keyof TabData, id: string) => void;
  onUpdate: (sectionKey: keyof TabData, id: string, field: string, value: string) => void;
}

function Table2Col({ rows, sectionKey, onAdd, onRemove, onUpdate }: Table2ColProps) {
  const safeRows = Array.isArray(rows) && rows.length > 0 
    ? rows 
    : [{ id: uid('default-'), pernyataan: '', keterlaksanaan: '' }];

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding row to:', sectionKey);
    onAdd(sectionKey, { pernyataan: '', keterlaksanaan: '' });
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Removing row:', id, 'from:', sectionKey);
    onRemove(sectionKey, id);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[#ADE7F7]/40">
            <tr>
              <th className="border border-gray-300 p-3 text-left w-1/2 font-semibold text-[#183A64]">
                Pernyataan Standar
              </th>
              <th className="border border-gray-300 p-3 text-left w-1/2 font-semibold text-[#183A64]">
                Keterlaksanaan
              </th>
              <th className="border border-gray-300 p-3 w-24 text-center font-semibold text-[#183A64]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {safeRows.map((r, index) => (
              <tr
                key={r.id}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#ADE7F7]/10'
                } hover:bg-[#ADE7F7]/20 transition-colors`}
              >
                <td className="border border-gray-300 p-2 align-top">
                  <textarea
                    value={r.pernyataan || ''}
                    onChange={(e) => onUpdate(sectionKey, r.id, 'pernyataan', e.target.value)}
                    className="w-full min-h-[80px] border border-gray-300 rounded p-2 text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                    placeholder="Isi pernyataan standar..."
                  />
                </td>
                <td className="border border-gray-300 p-2 align-top">
                  <textarea
                    value={r.keterlaksanaan || ''}
                    onChange={(e) => onUpdate(sectionKey, r.id, 'keterlaksanaan', e.target.value)}
                    className="w-full min-h-[80px] border border-gray-300 rounded p-2 text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                    placeholder="Isi keterlaksanaan..."
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center align-top">
                  <button
                    type="button"
                    onClick={(e) => handleRemoveClick(e, r.id)}
                    disabled={safeRows.length === 1}
                    className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={safeRows.length === 1 ? 'Minimal 1 baris harus ada' : 'Hapus baris'}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-300 flex justify-center">
        <button
          type="button"
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 bg-[#183A64] text-white px-5 py-2 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
        >
          <Plus className="h-4 w-4" /> Tambah Baris
        </button>
      </div>
    </div>
  );
}

interface SectionEvalProps {
  evalRows: RowEval[];
  onAdd: (sectionKey: keyof TabData, template: any) => void;
  onRemove: (sectionKey: keyof TabData, id: string) => void;
  onUpdate: (sectionKey: keyof TabData, id: string, field: string, value: string) => void;
}

function SectionEval({ evalRows, onAdd, onRemove, onUpdate }: SectionEvalProps) {
  const safeRows = Array.isArray(evalRows) && evalRows.length > 0
    ? evalRows
    : [{
        id: uid('ev-default-'),
        pernyataan: '',
        keterlaksanaan: '',
        evaluasi: '',
        tindak_lanjut: '',
        hasil_optimalisasi: '',
      }];

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding eval row');
    onAdd('evalRows', {
      pernyataan: '',
      keterlaksanaan: '',
      evaluasi: '',
      tindak_lanjut: '',
      hasil_optimalisasi: '',
    });
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Removing eval row:', id);
    onRemove('evalRows', id);
  };

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-[#183A64] text-lg mb-3 flex items-center gap-2">
        <span className="bg-[#183A64] text-white px-3 py-1 rounded">3</span>
        Evaluasi
      </h3>
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#ADE7F7]/40">
              <tr>
                <th className="border border-gray-300 p-3 text-left font-semibold text-[#183A64]">
                  Pernyataan Standar
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-[#183A64]">
                  Keterlaksanaan
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-[#183A64]">
                  Evaluasi
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-[#183A64]">
                  Tindak Lanjut
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-[#183A64]">
                  Hasil Optimalisasi
                </th>
                <th className="border border-gray-300 p-3 w-24 text-center font-semibold text-[#183A64]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {safeRows.map((r, index) => (
                <tr
                  key={r.id}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#ADE7F7]/10'
                  } hover:bg-[#ADE7F7]/20 transition-colors`}
                >
                  {(['pernyataan', 'keterlaksanaan', 'evaluasi', 'tindak_lanjut', 'hasil_optimalisasi'] as const).map(
                    (field) => (
                      <td key={field} className="border border-gray-300 p-2 align-top">
                        <textarea
                          value={r[field] || ''}
                          onChange={(e) => onUpdate('evalRows', r.id, field, e.target.value)}
                          className="w-full min-h-[60px] border border-gray-300 rounded p-2 text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                          placeholder={`Isi ${field.replace('_', ' ')}...`}
                        />
                      </td>
                    )
                  )}
                  <td className="border border-gray-300 p-2 text-center align-top">
                    <button
                      type="button"
                      onClick={(e) => handleRemoveClick(e, r.id)}
                      disabled={safeRows.length === 1}
                      className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      title={safeRows.length === 1 ? 'Minimal 1 baris harus ada' : 'Hapus baris'}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-gray-50 border-t border-gray-300 flex justify-center">
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-[#183A64] text-white px-5 py-2 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <Plus className="h-4 w-4" /> Tambah Baris
          </button>
        </div>
      </div>
    </div>
  );
}