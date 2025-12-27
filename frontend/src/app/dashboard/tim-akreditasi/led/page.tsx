'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash, Save, Info, Send, MessageSquare, X, AlertCircle } from 'lucide-react';
import { saveLEDDraft } from '../../../../services/ledService';
import type { TabData as ServiceTabData, RowEval as ServiceRowEval } from '../../../../services/ledService';
import { Toaster, toast } from 'sonner';
import { getAllLEDData, saveLEDTab } from '../../../../services/ledService';
import { getReviews as fetchReviews } from '@/services/reviewService';

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

function getUserId() {
  if (typeof window === "undefined") {
    throw new Error("Harus di client-side. Tunggu sampai browser mount.");
  }

  const idStr = localStorage.getItem("user_id");
  if (idStr) {
    const id = Number(idStr);
    if (!Number.isNaN(id)) return id;
  }

  const userJson = sessionStorage.getItem("user");
  if (userJson) {
    try {
      const userObj = JSON.parse(userJson);
      if (userObj && typeof userObj.id === 'number') {
        return userObj.id;
      }
      if (userObj && typeof userObj.id === 'string' && !isNaN(Number(userObj.id))) {
        return Number(userObj.id);
      }
    } catch {
      // JSON parsing error - ignore and fallback
    }
  }

  const sessionIdStr = sessionStorage.getItem("user_id");
  if (sessionIdStr) {
    const id = Number(sessionIdStr);
    if (!Number.isNaN(id)) return id;
  }

  throw new Error("User ID tidak ditemukan. Pastikan sudah login.");
}

const tabs = [
  ['budaya-mutu', 'C.1 Budaya Mutu'],
  ['relevansi-pendidikan', 'C.2 Relevansi Pendidikan'],
  ['relevansi-penelitian', 'C.3 Relevansi Penelitian'],
  ['relevansi-pkm', 'C.4 Relevansi PkM'],
  ['akuntabilitas', 'C.5 Akuntabilitas'],
  ['diferensiasi-misi', 'C.6 Diferensiasi Misi'],
];

const createEmptyTab = (): TabData => {
  const emptyRow2Col = () => ({ id: uid('row-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' });
  const emptyRowEval = () => ({ id: uid('eval-'), pernyataan: '', keterlaksanaan: '', evaluasi: '', tindak_lanjut: '', hasil_optimalisasi: '' });
  
  return {
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
  };
};

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
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());
  
  // State untuk P4M Notes Modal
  const [showP4MNotes, setShowP4MNotes] = useState(false);
  const [p4mNotes, setP4mNotes] = useState<any[]>([]);
  const [loadingP4mNotes, setLoadingP4mNotes] = useState(false);

  // Deklarasi mapServiceToUI dulu sebelum useEffect (untuk menghindari "before initialization" error)
  const mapServiceToUI = useCallback((svc: any): TabData => {
    const base = createEmptyTab();
    if (!svc || typeof svc !== 'object') return base;

    const norm2 = (arr: any[], prefix: string) => {
      const a = Array.isArray(arr) ? arr : [];
      if (a.length === 0) {
        return [{
          id: uid(`${prefix}-`),
          pernyataan: '',
          keterlaksanaan: '',
          pelaksanaan: '',
          bukti_pendukung: '',
        }];
      }
      return a.map((r) => ({
        id: r?.id || uid(`${prefix}-`),
        pernyataan: String(r?.pernyataan ?? ''),
        keterlaksanaan: String(r?.keterlaksanaan ?? ''),
        pelaksanaan: String(r?.pelaksanaan ?? ''),
        bukti_pendukung: String(r?.bukti_pendukung ?? ''),
      }));
    };
    
    const normEval = (arr: any[], prefix: string) => {
      const a = Array.isArray(arr) ? arr : [];
      if (a.length === 0) {
        return [{
          id: uid(`${prefix}-`),
          pernyataan: '',
          keterlaksanaan: '',
          evaluasi: '',
          tindak_lanjut: '',
          hasil_optimalisasi: '',
        }];
      }
      return a.map((r) => ({
        id: r?.id || uid(`${prefix}-`),
        pernyataan: r?.pernyataan ?? '',
        keterlaksanaan: r?.keterlaksanaan ?? '',
        evaluasi: r?.evaluasi ?? '',
        tindak_lanjut: r?.tindak_lanjut ?? '',
        hasil_optimalisasi: r?.hasil_optimalisasi ?? '',
      }));
    };

    // Handle backward compatibility: jika evalA/B/C tidak ada tapi evalRows ada, split evalRows
    let evalAData = svc.evalA;
    let evalBData = svc.evalB;
    let evalCData = svc.evalC;
    
    // Backward compatibility: jika evalA/B/C kosong/undefined tapi evalRows ada
    if (Array.isArray(svc.evalRows) && svc.evalRows.length > 0) {
      if (!Array.isArray(evalAData) || evalAData.length === 0) {
        evalAData = svc.evalRows.filter((r: any) => r?.table === 'A' || r?.tabel === 'A');
      }
      if (!Array.isArray(evalBData) || evalBData.length === 0) {
        evalBData = svc.evalRows.filter((r: any) => r?.table === 'B' || r?.tabel === 'B');
      }
      if (!Array.isArray(evalCData) || evalCData.length === 0) {
        evalCData = svc.evalRows.filter((r: any) => r?.table === 'C' || r?.tabel === 'C');
      }
      
      // Jika tidak ada marker table/tabel, split by index (bagi rata)
      if ((!evalAData || evalAData.length === 0) && 
          (!evalBData || evalBData.length === 0) && 
          (!evalCData || evalCData.length === 0)) {
        const third = Math.ceil(svc.evalRows.length / 3);
        evalAData = svc.evalRows.slice(0, third);
        evalBData = svc.evalRows.slice(third, third * 2);
        evalCData = svc.evalRows.slice(third * 2);
      }
    }

    return {
      penetapanA: norm2(svc.penetapanA, 'pa'),
      penetapanB: norm2(svc.penetapanB, 'pb'),
      penetapanC: norm2(svc.penetapanC, 'pc'),
      penetapanD: norm2(svc.penetapanD, 'pd'),
      pelaksanaanA: norm2(svc.pelaksanaanA || [], 'la'),
      pelaksanaanB: norm2(svc.pelaksanaanB || [], 'lb'),
      pelaksanaanC: norm2(svc.pelaksanaanC || [], 'lc'),
      pelaksanaanD: norm2(svc.pelaksanaanD || [], 'ld'),
      pengendalianA: norm2(svc.pengendalianA, 'ca'),
      pengendalianB: norm2(svc.pengendalianB, 'cb'),
      pengendalianC: norm2(svc.pengendalianC, 'cc'),
      pengendalianD: norm2(svc.pengendalianD, 'cd'),
      peningkatanA: norm2(svc.peningkatanA, 'ia'),
      peningkatanB: norm2(svc.peningkatanB, 'ib'),
      peningkatanC: norm2(svc.peningkatanC, 'ic'),
      peningkatanD: norm2(svc.peningkatanD, 'id'),
      evalA: normEval(evalAData, 'eva'),
      evalB: normEval(evalBData, 'evb'),
      evalC: normEval(evalCData, 'evc'),
    };
  }, []);

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
        // Load data dari backend untuk semua tabs
        const user_id = getUserId();
        const all = await getAllLEDData(user_id);
        console.log('Initial load - data dari backend:', all);
        
        const initialTabs: Record<string, TabData> = {};
        tabs.forEach(([key]) => {
          let svc = null as any;
          if (all) {
            if (all[key]) {
              svc = all[key];
            } else if (Array.isArray(all)) {
              svc = all.find((x: any) => x?.type === key || x?.tab === key || x?.key === key) || null;
            }
          }
          initialTabs[key] = svc ? mapServiceToUI(svc) : createEmptyTab();
        });
        setTabData(initialTabs);
        
        // Mark all tabs as loaded
        setLoadedTabs(new Set(tabs.map(([key]) => key)));
      } catch (err) {
        console.error('Gagal memuat data:', err);
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
  }, [isClient, mapServiceToUI]);

  const transformUIToServiceTabData = useCallback((ui: TabData): ServiceTabData => {
    const { evalA, evalB, evalC, pengendalianA, pengendalianB, pengendalianC, pengendalianD, 
            peningkatanA, peningkatanB, peningkatanC, peningkatanD, ...rest } = ui as any;
    
    const toSvcEval = (r: any): ServiceRowEval => ({
      id: r.id || uid('ev-'),
      pernyataan: r.pernyataan || '',
      keterlaksanaan: r.keterlaksanaan || '',
      pelaksanaan: r.pelaksanaan || '',
      bukti_pendukung: r.bukti_pendukung || '',
      evaluasi: r.evaluasi || '',
      tindak_lanjut: r.tindak_lanjut || '',
      hasil_optimalisasi: r.hasil_optimalisasi || '',
    });

    const combined: ServiceRowEval[] = [];
    if (Array.isArray(evalA)) combined.push(...evalA.map(toSvcEval));
    if (Array.isArray(evalB)) combined.push(...evalB.map(toSvcEval));
    if (Array.isArray(evalC)) combined.push(...evalC.map(toSvcEval));

    const result = { 
      ...rest, 
      evalRows: combined,
      evalA: Array.isArray(evalA) ? evalA.map(toSvcEval) : [],
      evalB: Array.isArray(evalB) ? evalB.map(toSvcEval) : [],
      evalC: Array.isArray(evalC) ? evalC.map(toSvcEval) : [],
    } as ServiceTabData;

    // Log untuk debugging
    console.log('📤 Transform UI to Service - Data yang akan disimpan:');
    console.log('   evalA rows:', result.evalA?.length || 0);
    console.log('   evalB rows:', result.evalB?.length || 0);
    console.log('   evalC rows:', result.evalC?.length || 0);
    console.log('   evalRows (combined):', result.evalRows?.length || 0);
    console.log('   penetapanA rows:', result.penetapanA?.length || 0);
    console.log('   penetapanB rows:', result.penetapanB?.length || 0);
    console.log('   pelaksanaanA rows:', result.pelaksanaanA?.length || 0);
    console.log('   pelaksanaanB rows:', result.pelaksanaanB?.length || 0);

    return result;
  }, []);

  const handleSave = useCallback(async (notify = true, auto = false) => {
    const activeLabel = tabs.find(([k]) => k === activeTab)?.[1] || activeTab;
    try {
      const user_id = getUserId();
      const svcData = transformUIToServiceTabData(tabData[activeTab]);
      await saveLEDTab(user_id, activeTab, svcData);

      if (notify && !auto) {
        toast.success(`✅ Data ${activeLabel} berhasil disimpan!`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      if (notify) {
        toast.error(`❌ Gagal menyimpan data. (Tab: ${activeLabel})`);
      }
    }
  }, [tabData, activeTab]);

  const handleSaveDraft = useCallback(async () => {
    const activeLabel = tabs.find(([k]) => k === activeTab)?.[1] || activeTab;
    try {
      toast('Menyimpan draft...', { icon: <Save size={16} /> });
      
      // PENTING: Save data ke LED table dulu sebelum create draft
      const user_id = getUserId();
      const svcData = transformUIToServiceTabData(tabData[activeTab]);
      await saveLEDTab(user_id, activeTab, svcData);
      console.log('Data LED berhasil di-save:', { activeTab, svcData });
      
      // Sekarang save draft reference
      const payload = {
        nama: `LED - ${activeTab}`,
        path: `/dashboard/tim-akreditasi/led?tab=${activeTab}`,
        status: 'Draft',
        type: activeTab,
        currentData: tabData[activeTab],
      };
      
      const json = await saveLEDDraft(payload);
      toast.success(`✅ Draft ${activeLabel} berhasil disimpan!`);
      
      // redirect to bukti pendukung
      setTimeout(() => {
        router.push('/dashboard/tim-akreditasi/bukti-pendukung');
      }, 1200);
    } catch (err: any) {
      console.error('Error save draft:', err);
      toast.error(`❌ Gagal menyimpan draft ${activeLabel}`);
    }
  }, [tabData, activeTab, router, transformUIToServiceTabData]);

  const handleSubmitForReview = useCallback(async () => {
    const activeLabel = tabs.find(([k]) => k === activeTab)?.[1] || activeTab;
    try {
      toast('Mengajukan untuk review...', { icon: <Save size={16} /> });
      
      // Save data ke LED table
      const user_id = getUserId();
      const svcData = transformUIToServiceTabData(tabData[activeTab]);
      await saveLEDTab(user_id, activeTab, svcData);
      console.log('✅ Data LED berhasil di-save untuk review:', { activeTab, user_id });
      
      // Save draft reference dengan status untuk review
      const payload = {
        nama: `LED - ${activeTab}`,
        path: `/dashboard/tim-akreditasi/led?tab=${activeTab}`,
        status: 'Submitted',
        type: activeTab,
        currentData: tabData[activeTab],
      };
      
      await saveLEDDraft(payload);
      console.log('✅ Draft reference berhasil disimpan dengan status Submitted');
      toast.success(`✅ ${activeLabel} berhasil diajukan untuk review!`);
      
      // Redirect ke bukti pendukung untuk melihat status
      setTimeout(() => {
        router.push(`/dashboard/tim-akreditasi/bukti-pendukung`);
      }, 1200);
    } catch (err: any) {
      console.error('❌ Error submit for review:', err);
      toast.error(`❌ Gagal mengajukan ${activeLabel} untuk review`);
    }
  }, [tabData, activeTab, router, transformUIToServiceTabData]);

  // Fungsi untuk melihat catatan P4M
  const handleViewP4mNotes = useCallback(async () => {
    setShowP4MNotes(true);
    setLoadingP4mNotes(true);
    
    try {
      // Fetch reviews for LED module dengan tab yang aktif
      const notes = await fetchReviews(`led-${activeTab}`);
      setP4mNotes(notes || []);
      console.log('📝 Catatan P4M untuk LED tab', activeTab, ':', notes);
    } catch (err) {
      console.error('Error fetching P4M notes:', err);
      setP4mNotes([]);
      toast.error('Gagal memuat catatan P4M');
    } finally {
      setLoadingP4mNotes(false);
    }
  }, [activeTab]);

  // Auto-save ke localStorage/DB dinonaktifkan agar data hilang jika tidak disimpan manual
  // Tidak ada interval auto-save.

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

  const loadTabFromBackend = useCallback(async (tabKey: string) => {
    // Jika tab sudah di-load, skip
    if (loadedTabs.has(tabKey)) {
      console.log(`Tab ${tabKey} sudah di-load, skip reload`);
      return;
    }

    try {
      const user_id = getUserId();
      console.log(`Loading tab ${tabKey} for user ${user_id}...`);
      const all = await getAllLEDData(user_id);
      console.log(`Data dari backend:`, all);
      
      // Asumsi getAllLEDData mengembalikan record/tab map atau array berisi objek dengan key 'type'/'tab'
      let svc = null as any;
      if (all) {
        if (all[tabKey]) {
          svc = all[tabKey];
        } else if (Array.isArray(all)) {
          svc = all.find((x: any) => x?.type === tabKey || x?.tab === tabKey || x?.key === tabKey) || null;
        }
      }
      
      console.log(`Data untuk tab ${tabKey}:`, svc);
      
      // Gunakan mapServiceToUI untuk data dari backend (akan create empty jika null)
      const mapped = mapServiceToUI(svc);
      console.log(`Mapped data untuk tab ${tabKey}:`, mapped);
      
      setTabData((prev) => ({ ...prev, [tabKey]: mapped }));
      setLoadedTabs((prev) => new Set(prev).add(tabKey));
    } catch (e) {
      console.error('Gagal memuat data tab dari backend:', e);
      // Tetap gunakan empty tab jika error
      setTabData((prev) => ({ ...prev, [tabKey]: createEmptyTab() }));
      setLoadedTabs((prev) => new Set(prev).add(tabKey));
    }
  }, [mapServiceToUI, loadedTabs]);

  // Tidak perlu load per tab karena sudah di-load semua di initial load

  if (!isClient) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#183A64] font-semibold text-lg">
        Memuat data Budaya Mutu...
      </div>
    );
  }

  const currentTabData = tabData[activeTab] || createEmptyTab();

  // Fungsi untuk menentukan apakah tabel harus extended (4 kolom)
  const isExtended = (sectionKey: keyof TabData): boolean => {
    // Extended hanya untuk section PELAKSANAAN pada tab tertentu
    const extendedTabs = ['budaya-mutu', 'relevansi-pendidikan', 'relevansi-penelitian', 'relevansi-pkm', 'akuntabilitas'];
    const isPelaksanaanSection = String(sectionKey).startsWith('pelaksanaan');
    return isPelaksanaanSection && extendedTabs.includes(activeTab);
  };

  // Fungsi untuk menentukan tabel mana yang ditampilkan
  const shouldShowTable = (tableKey: string): boolean => {
    // Diferensiasi Misi: hanya Tabel A
    if (activeTab === 'diferensiasi-misi') {
      return tableKey.endsWith('A');
    }
    
    // Budaya Mutu: Tabel A, B saja (Penetapan dan Pelaksanaan)
    if (activeTab === 'budaya-mutu') {
      return tableKey.endsWith('A') || tableKey.endsWith('B');
    }
    
    // Relevansi Pendidikan: Tabel A, B, C, D
    if (activeTab === 'relevansi-pendidikan') {
      return true; // Tampilkan semua tabel A, B, C, D
    }
    
    // Relevansi Penelitian & PkM: Tabel A, B, C
    if (activeTab === 'relevansi-penelitian' || activeTab === 'relevansi-pkm') {
      return tableKey.endsWith('A') || tableKey.endsWith('B') || tableKey.endsWith('C');
    }
    
    // Akuntabilitas: Tabel A, B
    if (activeTab === 'akuntabilitas') {
      return tableKey.endsWith('A') || tableKey.endsWith('B');
    }
    
    // Default: Tabel A, B
    return tableKey.endsWith('A') || tableKey.endsWith('B');
  };

  return (
    <div className="min-h-screen bg-white w-full">
      <Toaster position="top-right" richColors />
      <div className="w-full space-y-3 sm:space-y-4 md:space-y-6">
        <div className="bg-gradient-to-r from-[#183A64] to-[#2C5F8D] text-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">LAPORAN EVALUASI DIRI</h1>
          <p className="text-xs sm:text-sm mt-2 opacity-90">
            Kelola data LED untuk berbagai aspek standar pendidikan tinggi
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 bg-gray-100 p-1.5 sm:p-2 rounded-lg shadow-sm">
          {tabs.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setActiveTab(val)}
              className={`text-xs sm:text-sm py-1.5 sm:py-2.5 px-1.5 sm:px-2 rounded-lg border transition-all duration-200 font-medium ${
                activeTab === val
                  ? 'bg-[#183A64] text-white border-[#183A64] shadow-md scale-105'
                  : 'bg-white border-gray-300 text-[#183A64] hover:bg-[#ADE7F7] hover:border-[#183A64]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <div className="flex justify-between items-center border-b-4 border-[#183A64] pb-2 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl text-[#183A64] font-semibold">
              {tabs.find(([key]) => key === activeTab)?.[1]}
            </h2>
            <button
              onClick={handleViewP4mNotes}
              className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
              title="Lihat Catatan P4M"
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">Catatan P4M</span>
            </button>
          </div>

          <div className="flex items-start gap-2 sm:gap-3 bg-[#ADE7F7]/40 border-l-4 border-[#183A64] p-2 sm:p-3 md:p-4 rounded-lg mb-4 sm:mb-6">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#183A64] mt-1 flex-shrink-0" />
            <div className="text-xs sm:text-sm text-gray-700">
              <p className="font-medium mb-1">Panduan Pengisian:</p>
              <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                <li>Lengkapi tabel dengan pernyataan standar dan indikatornya</li>
                <li>Gunakan tombol <strong>Tambah Baris</strong> untuk menambah data baru</li>
                <li>Gunakan tombol <strong>Hapus</strong> untuk menghapus baris (minimal 1 baris)</li>
                <li>Data akan otomatis tersimpan setiap 30 detik</li>
              </ul>
            </div>
          </div>

          {/* Penetapan Section */}
          <div className="mb-6 sm:mb-8">
            <h3 className="font-semibold text-[#183A64] text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
              <span className="bg-[#183A64] text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm">1</span>
              Penetapan
            </h3>
            
            {shouldShowTable('penetapanA') && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel A</h4>
                <Table2Col
                  rows={currentTabData.penetapanA}
                  sectionKey="penetapanA"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  extended={isExtended('penetapanA')}
                />
              </div>
            )}
            
            {shouldShowTable('penetapanB') && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel B</h4>
                <Table2Col
                  rows={currentTabData.penetapanB}
                  sectionKey="penetapanB"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  extended={isExtended('penetapanB')}
                />
              </div>
            )}
            
            {shouldShowTable('penetapanC') && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel C</h4>
                <Table2Col
                  rows={currentTabData.penetapanC}
                  sectionKey="penetapanC"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  extended={isExtended('penetapanC')}
                />
              </div>
            )}
            
            {shouldShowTable('penetapanD') && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel D</h4>
                <Table2Col
                  rows={currentTabData.penetapanD}
                  sectionKey="penetapanD"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  extended={isExtended('penetapanD')}
                />
              </div>
            )}
          </div>

          {/* Pelaksanaan Section */}
          <div className="mb-6 sm:mb-8">
            <h3 className="font-semibold text-[#183A64] text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
              <span className="bg-[#183A64] text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm">2</span>
              Pelaksanaan
            </h3>
            
            {shouldShowTable('pelaksanaanA') && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel A</h4>
                <Table2Col
                  rows={currentTabData.pelaksanaanA}
                  sectionKey="pelaksanaanA"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  extended={isExtended('pelaksanaanA')}
                />
              </div>
            )}
            
            {shouldShowTable('pelaksanaanB') && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel B</h4>
                <Table2Col
                  rows={currentTabData.pelaksanaanB}
                  sectionKey="pelaksanaanB"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  extended={isExtended('pelaksanaanB')}
                />
              </div>
            )}
            
            {shouldShowTable('pelaksanaanC') && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel C - Pelaksanaan</h4>
                <Table2Col
                  rows={currentTabData?.pelaksanaanC || [{ id: uid('lc-default-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }]}
                  sectionKey="pelaksanaanC"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  extended={isExtended('pelaksanaanC')}
                />
              </div>
            )}
            
            {shouldShowTable('pelaksanaanD') && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel D</h4>
                <Table2Col
                  rows={currentTabData.pelaksanaanD}
                  sectionKey="pelaksanaanD"
                  onAdd={handleAddRow}
                  onRemove={handleRemoveRow}
                  onUpdate={handleUpdateRow}
                  extended={isExtended('pelaksanaanD')}
                />
              </div>
            )}
          </div>

          {/* EVALUASI, PENGENDALIAN, PENINGKATAN Section */}
          <div className="mb-6 sm:mb-8">
            <h3 className="font-semibold text-[#183A64] text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
              <span className="bg-[#183A64] text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded text-xs sm:text-sm">3</span>
              EVALUASI, PENGENDALIAN, PENINGKATAN
            </h3>
            <div className="mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel A</h4>
              <SectionEval
                titleSuffix="A"
                sectionKey="evalA"
                evalRows={currentTabData.evalA}
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
              />
            </div>
            <div className="mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel B</h4>
              <SectionEval
                titleSuffix="B"
                sectionKey="evalB"
                evalRows={currentTabData.evalB}
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
              />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-2">Tabel C</h4>
              <SectionEval
                titleSuffix="C"
                sectionKey="evalC"
                evalRows={currentTabData.evalC}
                onAdd={handleAddRow}
                onRemove={handleRemoveRow}
                onUpdate={handleUpdateRow}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200 text-xs sm:text-sm"
            >
              <Save className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Save Draft</span>
              <span className="inline sm:hidden">Draft</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitForReview}
              className="inline-flex items-center gap-1 sm:gap-2 bg-[#183A64] text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-md hover:shadow-lg font-medium text-xs sm:text-sm"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Ajukan untuk Review</span>
              <span className="inline sm:hidden">Ajukan</span>
            </button>
          </div>
        </div>

        {/* Modal Catatan P4M */}
        {showP4MNotes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b bg-purple-50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-purple-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Catatan P4M - {tabs.find(([k]) => k === activeTab)?.[1]}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowP4MNotes(false)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingP4mNotes ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Memuat catatan P4M...</p>
                  </div>
                ) : p4mNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">Belum ada catatan dari P4M</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Catatan akan muncul setelah P4M melakukan review
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {p4mNotes.map((note: any) => (
                      <div 
                        key={note.id} 
                        className={`border-l-4 rounded-lg p-4 ${
                          note.status === 'Diterima' 
                            ? 'bg-green-50 border-green-500' 
                            : 'bg-orange-50 border-orange-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              note.status === 'Diterima' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {note.status || 'Diterima'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(note.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          Reviewer: <span className="font-medium text-gray-700">
                            {note.user?.nama_lengkap || note.user?.username || 'P4M'}
                          </span>
                        </div>
                        <div className="text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border">
                          {note.note}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowP4MNotes(false)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
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
  extended?: boolean;
}

function Table2Col({ rows, sectionKey, onAdd, onRemove, onUpdate, extended = false }: Table2ColProps) {
  const safeRows = Array.isArray(rows) && rows.length > 0
    ? rows
    : [{ id: uid('default-'), pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' }];

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onAdd(sectionKey, { pernyataan: '', keterlaksanaan: '', pelaksanaan: '', bukti_pendukung: '' });
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(sectionKey, id);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3 sm:mb-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead className="bg-[#ADE7F7]/40">
            <tr>
              <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64] min-w-[200px]">
                Pernyataan Standar
              </th>
              <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64] min-w-[200px]">
                Indikator
              </th>
              {extended && (
                <>
                  <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64] min-w-[200px]">
                    Pelaksanaan
                  </th>
                  <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64] min-w-[200px]">
                    Bukti Pendukung
                  </th>
                </>
              )}
              <th className="border border-gray-300 p-2 sm:p-3 w-16 sm:w-24 text-center font-semibold text-[#183A64]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {safeRows.map((r, index) => (
              <tr
                key={`${sectionKey}-${r.id}-${index}`}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#ADE7F7]/10'
                } hover:bg-[#ADE7F7]/20 transition-colors`}
              >
                <td className="border border-gray-300 p-1.5 sm:p-2 align-top">
                  <textarea
                    key={`${sectionKey}-${r.id}-pernyataan`}
                    value={r.pernyataan || ''}
                    onChange={(e) => onUpdate(sectionKey, r.id, 'pernyataan', e.target.value)}
                    readOnly={false}
                    className="w-full min-h-[60px] sm:min-h-[80px] border border-gray-300 rounded p-1.5 sm:p-2 text-xs sm:text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                    placeholder="Isi pernyataan standar..."
                  />
                </td>
                <td className="border border-gray-300 p-1.5 sm:p-2 align-top">
                  <textarea
                    key={`${sectionKey}-${r.id}-keterlaksanaan`}
                    value={r.keterlaksanaan || ''}
                    onChange={(e) => onUpdate(sectionKey, r.id, 'keterlaksanaan', e.target.value)}
                    readOnly={false}
                    className="w-full min-h-[60px] sm:min-h-[80px] border border-gray-300 rounded p-1.5 sm:p-2 text-xs sm:text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                    placeholder="Isi indikator..."
                  />
                </td>
                {extended && (
                  <>
                    <td className="border border-gray-300 p-1.5 sm:p-2 align-top">
                      <textarea
                        key={`${sectionKey}-${r.id}-pelaksanaan`}
                        value={r.pelaksanaan || ''}
                        onChange={(e) => onUpdate(sectionKey, r.id, 'pelaksanaan', e.target.value)}
                        readOnly={false}
                        className="w-full min-h-[60px] sm:min-h-[80px] border border-gray-300 rounded p-1.5 sm:p-2 text-xs sm:text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                        placeholder="Isi pelaksanaan..."
                      />
                    </td>
                    <td className="border border-gray-300 p-1.5 sm:p-2 align-top">
                      <textarea
                        key={`${sectionKey}-${r.id}-bukti_pendukung`}
                        value={r.bukti_pendukung || ''}
                        onChange={(e) => onUpdate(sectionKey, r.id, 'bukti_pendukung', e.target.value)}
                        readOnly={false}
                        className="w-full min-h-[60px] sm:min-h-[80px] border border-gray-300 rounded p-1.5 sm:p-2 text-xs sm:text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                        placeholder="Isi bukti pendukung..."
                      />
                    </td>
                  </>
                )}
                <td className="border border-gray-300 p-1.5 sm:p-2 text-center align-top">
                  <button
                    type="button"
                    onClick={(e) => handleRemoveClick(e, r.id)}
                    disabled={safeRows.length === 1}
                    className="inline-flex items-center gap-1 bg-red-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                    title={safeRows.length === 1 ? 'Minimal 1 baris harus ada' : 'Hapus baris'}
                  >
                    <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-2 sm:p-3 bg-gray-50 border-t border-gray-300 flex justify-center">
        <button
          type="button"
          onClick={handleAddClick}
          className="inline-flex items-center gap-1 sm:gap-2 bg-[#183A64] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Tambah</span> Baris
        </button>
      </div>
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
}

function SectionEval({ evalRows, sectionKey, titleSuffix, onAdd, onRemove, onUpdate }: SectionEvalProps) {
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
    onAdd(sectionKey, {
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
    onRemove(sectionKey, id);
  };

  return (
    <div>
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead className="bg-[#ADE7F7]/40">
              <tr>
                <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64]">
                  Pernyataan Standar
                </th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64]">
                  Indikator
                </th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64]">
                  Evaluasi
                </th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64]">
                  Tindak Lanjut
                </th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-[#183A64]">
                  Hasil Optimalisasi
                </th>
                <th className="border border-gray-300 p-2 sm:p-3 w-16 sm:w-24 text-center font-semibold text-[#183A64]">
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
                      <td key={field} className="border border-gray-300 p-1.5 sm:p-2 align-top">
                        <textarea
                          value={r[field] || ''}
                          onChange={(e) => onUpdate(sectionKey, r.id, field, e.target.value)}
                          className="w-full min-h-[50px] sm:min-h-[60px] border border-gray-300 rounded p-1 sm:p-2 text-xs sm:text-sm resize-y focus:border-[#183A64] focus:ring-2 focus:ring-[#ADE7F7]/50 focus:outline-none"
                          placeholder={`Isi ${field.replace('_', ' ')}...`}
                        />
                      </td>
                    )
                  )}
                  <td className="border border-gray-300 p-1.5 sm:p-2 text-center align-top">
                    <button
                      type="button"
                      onClick={(e) => handleRemoveClick(e, r.id)}
                      disabled={safeRows.length === 1}
                      className="inline-flex items-center gap-1 bg-red-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                      title={safeRows.length === 1 ? 'Minimal 1 baris harus ada' : 'Hapus baris'}
                    >
                      <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-2 sm:p-3 bg-gray-50 border-t border-gray-300 flex justify-center">
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-1 sm:gap-2 bg-[#183A64] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg hover:bg-[#2C5F8D] transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs sm:text-sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Tambah</span> Baris
          </button>
        </div>
      </div>
    </div>
  );
}