'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash, Save, Info, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllLEDData, submitLEDReview } from '@/services/ledService';

type Row2Col = { id: string; pernyataan: string; keterlaksanaan: string; pelaksanaan: string; bukti_pendukung: string };
type RowEval = {
  id: string;
  pernyataan: string;
  keterlaksanaan: string;
  pelaksanaan?: string;
  bukti_pendukung?: string;
  evaluasi: string;
  tindak_lanjut: string;
  hasil_optimalisasi: string;
};

type TabData = {
  penetapanA: Row2Col[];
  penetapanB: Row2Col[];
  penetapanC: Row2Col[];
  penetapanD: Row2Col[];
  pelaksanaanA: Row2Col[];
  pelaksanaanB: Row2Col[];
  pelaksanaanC: Row2Col[];
  pelaksanaanD: Row2Col[];
  pengendalianA: Row2Col[];
  pengendalianB: Row2Col[];
  pengendalianC: Row2Col[];
  pengendalianD: Row2Col[];
  peningkatanA: Row2Col[];
  peningkatanB: Row2Col[];
  peningkatanC: Row2Col[];
  peningkatanD: Row2Col[];
  evalA: RowEval[];
  evalB: RowEval[];
  evalC: RowEval[];
};

const uid = (p = '') => p + Math.random().toString(36).substring(2, 9);

function getUserIdFromStorage() {
  if (typeof window === "undefined") return null;
  
  const idStr = localStorage.getItem("user_id");
  if (idStr) {
    const id = Number(idStr);
    if (!Number.isNaN(id)) return id;
  }

  const userJson = sessionStorage.getItem("user");
  if (userJson) {
    try {
      const userObj = JSON.parse(userJson);
      if (userObj && typeof userObj.id === 'number') return userObj.id;
      if (userObj && typeof userObj.id === 'string' && !isNaN(Number(userObj.id))) {
        return Number(userObj.id);
      }
    } catch {}
  }

  return null;
}

const tabs = [
  ['budaya-mutu', 'C.1 Budaya Mutu'],
  ['relevansi-pendidikan', 'C.2 Relevansi Pendidikan'],
  ['relevansi-penelitian', 'C.3 Relevansi Penelitian'],
  ['relevansi-pkm', 'C.4 Relevansi PKM'],
  ['akuntabilitas', 'C.5 Akuntabilitas'],
  ['diferensiasi-misi', 'C.6 Diferensiasi Misi'],
];

const createEmptyTab = (): TabData => ({
  penetapanA: [{ id: uid('pa-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  penetapanB: [{ id: uid('pb-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  penetapanC: [{ id: uid('pc-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  penetapanD: [{ id: uid('pd-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  pelaksanaanA: [{ id: uid('la-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  pelaksanaanB: [{ id: uid('lb-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  pelaksanaanC: [{ id: uid('lc-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  pelaksanaanD: [{ id: uid('ld-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  pengendalianA: [{ id: uid('ca-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  pengendalianB: [{ id: uid('cb-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  pengendalianC: [{ id: uid('cc-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  pengendalianD: [{ id: uid('cd-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  peningkatanA: [{ id: uid('ia-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  peningkatanB: [{ id: uid('ib-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  peningkatanC: [{ id: uid('ic-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  peningkatanD: [{ id: uid('id-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }],
  evalA: [{ id: uid('eva-'), pernyataan: '', keterlaksanaan: '', evaluasi: '', tindak_lanjut: '', hasil_optimalisasi: '' }],
  evalB: [{ id: uid('evb-'), pernyataan: '', keterlaksanaan: '', evaluasi: '', tindak_lanjut: '', hasil_optimalisasi: '' }],
  evalC: [{ id: uid('evc-'), pernyataan: '', keterlaksanaan: '', evaluasi: '', tindak_lanjut: '', hasil_optimalisasi: '' }],
});

export default function BudayaMutuLEDPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const param = searchParams.get('tab');
    const valid = tabs.map(([k]) => k);
    if (param && valid.includes(param)) return param;
    return 'budaya-mutu';
  });
  const [loading, setLoading] = useState(true);
  const [tabData, setTabData] = useState<Record<string, TabData>>({});
  const [reviewedUserId, setReviewedUserId] = useState<number | null>(null);
  
  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'Perlu Revisi' | 'Diterima'>('Diterima');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const currentTab = searchParams.get('tab');
    if (currentTab !== activeTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', activeTab);
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [activeTab, isClient, searchParams, router]);

  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      try {
        // Ambil userId dari query parameter (jika ada) atau gunakan default untuk testing
        const userIdParam = searchParams.get('userId');
        const targetUserId = userIdParam ? Number(userIdParam) : getUserIdFromStorage();
        
        if (!targetUserId) {
          toast.error('User ID tidak ditemukan. Silakan login kembali.');
          setLoading(false);
          return;
        }

        setReviewedUserId(targetUserId);
        console.log(`📥 [Review LED] Loading data for user ${targetUserId}`);

        // Ambil semua data LED untuk user yang akan direview
        const allLEDData = await getAllLEDData(targetUserId);
        console.log('Data LED yang diterima:', allLEDData);
        
        if (allLEDData && Object.keys(allLEDData).length > 0) {
          const loadedTabs: Record<string, TabData> = {};
          
          tabs.forEach(([key]) => {
            if (allLEDData[key]) {
              // Map data dari backend ke format UI
              const data = allLEDData[key];
              loadedTabs[key] = {
                penetapanA: Array.isArray(data.penetapanA) && data.penetapanA.length > 0 
                  ? data.penetapanA 
                  : createEmptyTab().penetapanA,
                penetapanB: Array.isArray(data.penetapanB) && data.penetapanB.length > 0
                  ? data.penetapanB
                  : createEmptyTab().penetapanB,
                penetapanC: Array.isArray(data.penetapanC) && data.penetapanC.length > 0
                  ? data.penetapanC
                  : createEmptyTab().penetapanC,
                penetapanD: Array.isArray(data.penetapanD) && data.penetapanD.length > 0
                  ? data.penetapanD
                  : createEmptyTab().penetapanD,
                pelaksanaanA: Array.isArray(data.pelaksanaanA) && data.pelaksanaanA.length > 0
                  ? data.pelaksanaanA
                  : createEmptyTab().pelaksanaanA,
                pelaksanaanB: Array.isArray(data.pelaksanaanB) && data.pelaksanaanB.length > 0
                  ? data.pelaksanaanB
                  : createEmptyTab().pelaksanaanB,
                pelaksanaanC: Array.isArray(data.pelaksanaanC) && data.pelaksanaanC.length > 0
                  ? data.pelaksanaanC
                  : createEmptyTab().pelaksanaanC,
                pelaksanaanD: Array.isArray(data.pelaksanaanD) && data.pelaksanaanD.length > 0
                  ? data.pelaksanaanD
                  : createEmptyTab().pelaksanaanD,
                pengendalianA: Array.isArray(data.pengendalianA) && data.pengendalianA.length > 0
                  ? data.pengendalianA
                  : createEmptyTab().pengendalianA,
                pengendalianB: Array.isArray(data.pengendalianB) && data.pengendalianB.length > 0
                  ? data.pengendalianB
                  : createEmptyTab().pengendalianB,
                pengendalianC: Array.isArray(data.pengendalianC) && data.pengendalianC.length > 0
                  ? data.pengendalianC
                  : createEmptyTab().pengendalianC,
                pengendalianD: Array.isArray(data.pengendalianD) && data.pengendalianD.length > 0
                  ? data.pengendalianD
                  : createEmptyTab().pengendalianD,
                peningkatanA: Array.isArray(data.peningkatanA) && data.peningkatanA.length > 0
                  ? data.peningkatanA
                  : createEmptyTab().peningkatanA,
                peningkatanB: Array.isArray(data.peningkatanB) && data.peningkatanB.length > 0
                  ? data.peningkatanB
                  : createEmptyTab().peningkatanB,
                peningkatanC: Array.isArray(data.peningkatanC) && data.peningkatanC.length > 0
                  ? data.peningkatanC
                  : createEmptyTab().peningkatanC,
                peningkatanD: Array.isArray(data.peningkatanD) && data.peningkatanD.length > 0
                  ? data.peningkatanD
                  : createEmptyTab().peningkatanD,
                evalA: Array.isArray((data as any).evalA) && (data as any).evalA.length > 0 
                  ? (data as any).evalA 
                  : (Array.isArray((data as any).evalRows) && (data as any).evalRows.length > 0 ? (data as any).evalRows : createEmptyTab().evalA),
                evalB: Array.isArray((data as any).evalB) && (data as any).evalB.length > 0
                  ? (data as any).evalB
                  : createEmptyTab().evalB,
                evalC: Array.isArray((data as any).evalC) && (data as any).evalC.length > 0
                  ? (data as any).evalC
                  : createEmptyTab().evalC,
              };
            } else {
              loadedTabs[key] = createEmptyTab();
            }
          });
          
          setTabData(loadedTabs);
          console.log('✅ Data berhasil dimuat:', loadedTabs);
        } else {
          console.log('⚠️ Tidak ada data LED, menggunakan data kosong');
          const initialTabs: Record<string, TabData> = {};
          tabs.forEach(([key]) => {
            initialTabs[key] = createEmptyTab();
          });
          setTabData(initialTabs);
        }
      } catch (err) {
        console.error('❌ Gagal memuat data:', err);
        toast.error('Gagal memuat data LED');
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
  }, [isClient, searchParams]);

  const handleSave = useCallback(async (notify = true, auto = false) => {
    // Tidak perlu save di review mode, data read-only
    return;
  }, []);

  const handleSubmitReview = async () => {
    try {
      const activeLabel = tabs.find(([k]) => k === activeTab)?.[1] || activeTab;
      
      if (!reviewedUserId) {
        toast.error('User ID yang direview tidak ditemukan');
        return;
      }

      if (!reviewNotes.trim()) {
        toast.warning('Mohon isi catatan reviewer');
        return;
      }
      
      // Call API untuk submit review
      await submitLEDReview({
        tab: activeTab,
        status: reviewStatus,
        notes: reviewNotes,
        reviewed_user_id: reviewedUserId,
      });

      toast.success(`✅ Review untuk ${activeLabel} berhasil disimpan!`);
      setShowReviewModal(false);
      setReviewNotes('');
      setReviewStatus('Diterima');
      
      // Redirect ke dashboard P4M
      setTimeout(() => {
        router.push('/dashboard/p4m');
      }, 1500);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('❌ Gagal menyimpan review');
    }
  };

  useEffect(() => {
    // Tidak perlu auto-save di review mode
    return;
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

  // Fungsi untuk menentukan tabel mana yang ditampilkan (sama seperti LED Tim Akreditasi)
  const shouldShowTable = (tableKey: string): boolean => {
    if (activeTab === 'diferensiasi-misi') {
      return tableKey.endsWith('A');
    }
    if (activeTab === 'relevansi-pendidikan') {
      return true;
    }
    if (activeTab === 'relevansi-penelitian' || activeTab === 'relevansi-pkm') {
      return tableKey.endsWith('A') || tableKey.endsWith('B') || tableKey.endsWith('C');
    }
    return tableKey.endsWith('A') || tableKey.endsWith('B');
  };

  const currentTabData = tabData[activeTab] || createEmptyTab();

  return (
    <div className="min-h-screen bg-white p-6">
      <Toaster position="top-right" richColors />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#183A64] to-[#2C5F8D] text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold">LAPORAN EVALUASI DIRI</h1>
          <p className="text-sm mt-2 opacity-90">
            Kelola data LED untuk berbagai aspek standar pendidikan tinggi
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
                <li>Lengkapi tabel dengan pernyataan standar dan indikatornya</li>
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
            
            {shouldShowTable('penetapanA') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel A</h4>
                <Table2Col
                  rows={currentTabData.penetapanA}
                  sectionKey="penetapanA"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  readOnly={true}
                />
              </div>
            )}
            
            {shouldShowTable('penetapanB') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel B</h4>
                <Table2Col
                  rows={currentTabData.penetapanB}
                  sectionKey="penetapanB"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  readOnly={true}
                />
              </div>
            )}
            
            {shouldShowTable('penetapanC') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel C</h4>
                <Table2Col
                  rows={currentTabData.penetapanC}
                  sectionKey="penetapanC"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  readOnly={true}
                />
              </div>
            )}
            
            {shouldShowTable('penetapanD') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel D</h4>
                <Table2Col
                  rows={currentTabData.penetapanD}
                  sectionKey="penetapanD"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  readOnly={true}
                />
              </div>
            )}
          </div>

          {/* Pelaksanaan Section */}
          <div className="mb-8">
            <h3 className="font-semibold text-[#183A64] text-lg mb-3 flex items-center gap-2">
              <span className="bg-[#183A64] text-white px-3 py-1 rounded">2</span>
              Pelaksanaan
            </h3>
            
            {shouldShowTable('pelaksanaanA') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel A</h4>
                <Table2Col
                  rows={currentTabData.pelaksanaanA}
                  sectionKey="pelaksanaanA"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  readOnly={true}
                />
              </div>
            )}
            
            {shouldShowTable('pelaksanaanB') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel B</h4>
                <Table2Col
                  rows={currentTabData.pelaksanaanB}
                  sectionKey="pelaksanaanB"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  readOnly={true}
                />
              </div>
            )}
            
            {shouldShowTable('pelaksanaanC') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel C</h4>
                <Table2Col
                  rows={currentTabData.pelaksanaanC}
                  sectionKey="pelaksanaanC"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  readOnly={true}
                />
              </div>
            )}
            
            {shouldShowTable('pelaksanaanD') && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel D</h4>
                <Table2Col
                  rows={currentTabData.pelaksanaanD}
                  sectionKey="pelaksanaanD"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  readOnly={true}
                />
              </div>
            )}
          </div>

          {/* EVALUASI, PENGENDALIAN, PENINGKATAN Section */}
          <div className="mb-8">
            <h3 className="font-semibold text-[#183A64] text-lg mb-3 flex items-center gap-2">
              <span className="bg-[#183A64] text-white px-3 py-1 rounded">3</span>
              EVALUASI, PENGENDALIAN, PENINGKATAN
            </h3>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel A</h4>
              <SectionEval
                titleSuffix="A"
                sectionKey="evalA"
                evalRows={currentTabData.evalA}
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
                readOnly={true}
              />
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel B</h4>
              <SectionEval
                titleSuffix="B"
                sectionKey="evalB"
                evalRows={currentTabData.evalB}
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
                readOnly={true}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Tabel C</h4>
              <SectionEval
                titleSuffix="C"
                sectionKey="evalC"
                evalRows={currentTabData.evalC}
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
                readOnly={true}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 bg-[#183A64] text-white px-6 py-3 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <CheckCircle className="h-5 w-5" />
              Aksi Review
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#183A64] to-[#2C5F8D] text-white p-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold">Form Review LED</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#ADE7F7]/20 border-l-4 border-[#183A64] p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Tab yang direview:</strong> {tabs.find(([k]) => k === activeTab)?.[1]}
                </p>
              </div>

              {/* Status Review */}
              <div>
                <label className="block text-sm font-semibold text-[#183A64] mb-2">
                  Status Review <span className="text-red-500">*</span>
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as 'Perlu Revisi' | 'Diterima')}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                >
                  <option value="Diterima">✅ Diterima</option>
                  <option value="Perlu Revisi">⚠️ Perlu Revisi</option>
                </select>
              </div>

              {/* Catatan Reviewer */}
              <div>
                <label className="block text-sm font-semibold text-[#183A64] mb-2">
                  Catatan Reviewer <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={6}
                  placeholder="Berikan catatan atau feedback untuk Tim Akreditasi..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Catatan ini akan dikirim ke Tim Akreditasi sebagai feedback
                </p>
              </div>

              {/* Alert berdasarkan status */}
              {reviewStatus === 'Perlu Revisi' && (
                <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Status: Perlu Revisi</p>
                    <p className="mt-1">Data akan dikembalikan ke Tim Akreditasi untuk diperbaiki</p>
                  </div>
                </div>
              )}

              {reviewStatus === 'Diterima' && (
                <div className="flex items-start gap-3 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Status: Diterima</p>
                    <p className="mt-1">Data akan disetujui dan dilanjutkan ke tahap berikutnya</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewNotes('');
                    setReviewStatus('Diterima');
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={!reviewNotes.trim()}
                  className="px-6 py-2.5 bg-[#183A64] text-white rounded-lg hover:bg-[#2C5F8D] transition-colors font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                >
                  <span className="inline-flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Simpan Review
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  readOnly?: boolean;
}

function Table2Col({ rows, sectionKey, onAdd, onRemove, onUpdate, readOnly = false }: Table2ColProps) {
  const safeRows = Array.isArray(rows) && rows.length > 0 
    ? rows 
    : [{ id: uid('default-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }];

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding row to:', sectionKey);
    onAdd(sectionKey, { pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' });
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
                Indikator
              </th>
              {!readOnly && (
                <th className="border border-gray-300 p-3 w-24 text-center font-semibold text-[#183A64]">
                  Aksi
                </th>
              )}
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
                    readOnly={readOnly}
                    className={`w-full min-h-[80px] border border-gray-300 rounded p-2 text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none ${
                      readOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Isi pernyataan standar..."
                  />
                </td>
                <td className="border border-gray-300 p-2 align-top">
                  <textarea
                    value={r.keterlaksanaan || ''}
                    onChange={(e) => onUpdate(sectionKey, r.id, 'keterlaksanaan', e.target.value)}
                    readOnly={readOnly}
                    className={`w-full min-h-[80px] border border-gray-300 rounded p-2 text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none ${
                      readOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="Isi indikator..."
                  />
                </td>
                {!readOnly && (
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
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <div className="p-3 bg-gray-50 border-t border-gray-300 flex justify-center">
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-[#183A64] text-white px-5 py-2 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <Plus className="h-4 w-4" /> Tambah Baris
          </button>
        </div>
      )}
    </div>
  );
}

interface SectionEvalProps {
  evalRows: RowEval[];
  sectionKey: keyof TabData;
  titleSuffix: 'A' | 'B' | 'C';
  onAdd: (sectionKey: keyof TabData, template: any) => void;
  onRemove: (sectionKey: keyof TabData, id: string) => void;
  onUpdate: (sectionKey: keyof TabData, id: string, field: string, value: string) => void;
  readOnly?: boolean;
}

function SectionEval({ evalRows, sectionKey, titleSuffix, onAdd, onRemove, onUpdate, readOnly = false }: SectionEvalProps) {
  const safeRows = Array.isArray(evalRows) && evalRows.length > 0
    ? evalRows
    : [{
        id: uid('ev-default-'),
        pernyataan: '',
        keterlaksanaan: '',
        pelaksanaan: '',
        bukti_pendukung: '',
        evaluasi: '',
        tindak_lanjut: '',
        hasil_optimalisasi: '',
      }];

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Adding eval row');
    onAdd(sectionKey, {
      pernyataan: '',
      keterlaksanaan: '',
      pelaksanaan: '',
      bukti_pendukung: '',
      evaluasi: '',
      tindak_lanjut: '',
      hasil_optimalisasi: '',
    });
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Removing eval row:', id);
    onRemove(sectionKey, id);
  };

  
  return (
    <div>
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#ADE7F7]/40">
              <tr>
                <th className="border border-gray-300 p-3 text-left font-semibold text-[#183A64]">
                  Pernyataan Standar
                </th>
                <th className="border border-gray-300 p-3 text-left font-semibold text-[#183A64]">
                  Indikator
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
                {!readOnly && (
                  <th className="border border-gray-300 p-3 w-24 text-center font-semibold text-[#183A64]">
                    Aksi
                  </th>
                )}
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
                          onChange={(e) => onUpdate(sectionKey, r.id, field, e.target.value)}
                          readOnly={readOnly}
                          className={`w-full min-h-[60px] border border-gray-300 rounded p-2 text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none ${
                            readOnly ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                          placeholder={`Isi ${field.replace('_', ' ')}...`}
                        />
                      </td>
                    )
                  )}
                  {!readOnly && (
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
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <div className="p-3 bg-gray-50 border-t border-gray-300 flex justify-center">
            <button
              type="button"
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-[#183A64] text-white px-5 py-2 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <Plus className="h-4 w-4" /> Tambah Baris
            </button>
          </div>
        )}
      </div>
    </div>
  );
}