'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Save, Plus, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RelevansiPenelitianPage() {
  const pathname = usePathname();
  const [activeSubTab, setActiveSubTab] = useState('sarana-prasarana');
  const [data, setData] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [importing, setImporting] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const API_BASE = 'http://localhost:5000/api/relevansi-penelitian';

  const tabs = [
    { label: 'Budaya Mutu', href: '/dashboard/tim-akreditasi/lkps' },
    { label: 'Relevansi Pendidikan', href: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan' },
    { label: 'Relevansi Penelitian', href: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian' },
    { label: 'Relevansi PKM', href: '/dashboard/tim-akreditasi/lkps/relevansi-pkm' },
    { label: 'Akuntabilitas', href: '/dashboard/tim-akreditasi/lkps/akuntabilitas' },
    { label: 'Diferensiasi Misi', href: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi' },
  ];

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    try {
      setErrorMsg(null);
      const res = await fetch(`${API_BASE}?type=${activeSubTab}`);
      if (!res.ok) {
        // include response body for debugging when possible
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
      }
      const json = await res.json();
      // support both { data: [...] } and plain [...] responses
      setData(json.data ?? json ?? []);
    } catch (err: any) {
      console.error('fetchData error', err);
      setErrorMsg(err?.message || String(err));
      setData([]);
    }
  };

  // handle excel file selection and upload
  async function handleFileChange(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setErrorMsg(null);
    setPreviewFile(null);
    setPreviewHeaders([]);
    setPreviewRows([]);
    setSuggestions({});
    setMapping({});
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', activeSubTab);
      fd.append('preview', 'true');

      const res = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
      }
      const json = await res.json();
      // set preview data and open mapping modal
      setPreviewFile(file);
      setPreviewHeaders(json.headers || []);
      setPreviewRows(json.previewRows || []);
      setSuggestions(json.suggestions || {});

      // initialize mapping with suggestions where available
      const initMap: Record<string, string> = {};
      (json.headers || []).forEach((h: string) => {
        initMap[h] = json.suggestions && json.suggestions[h] ? json.suggestions[h] : '';
      });
      setMapping(initMap);
      setShowPreviewModal(true);
    } catch (err: any) {
      console.error('import preview error', err);
      setErrorMsg(err?.message || String(err));
    } finally {
      setImporting(false);
      try { e.target.value = ''; } catch {}
    }
  }

  // commit the import using mapping and the stored previewFile
  async function commitImport() {
    if (!previewFile) return;
    setImporting(true);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', previewFile);
      fd.append('type', activeSubTab);
      fd.append('mapping', JSON.stringify(mapping));

      const res = await fetch(`${API_BASE}/import`, { method: 'POST', body: fd });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
      }
      const json = await res.json();
      await fetchData();
      setShowPreviewModal(false);
      setPreviewFile(null);
      alert(json.message || 'Import berhasil');
    } catch (err: any) {
      console.error('commit import error', err);
      setErrorMsg(err?.message || String(err));
    } finally {
      setImporting(false);
    }
  }

  // apply suggestions to mapping (auto map) and preset helpers
  function applySuggestions() {
    const newMap: Record<string, string> = { ...(mapping || {}) };
    previewHeaders.forEach((h) => {
      if (suggestions && suggestions[h]) newMap[h] = suggestions[h];
      else if (!newMap[h]) newMap[h] = '';
    });
    setMapping(newMap);
  }

  function savePresetForSubtab() {
    try {
      const key = `importPreset:${activeSubTab}`;
      const all = JSON.parse(localStorage.getItem('importPresets') || '{}');
      all[key] = mapping || {};
      localStorage.setItem('importPresets', JSON.stringify(all));
      alert('Preset mapping disimpan untuk ' + activeSubTab);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan preset');
    }
  }

  function loadPresetForSubtab() {
    try {
      const key = `importPreset:${activeSubTab}`;
      const all = JSON.parse(localStorage.getItem('importPresets') || '{}');
      if (all && all[key]) setMapping(all[key]);
    } catch (e) {
      console.error(e);
    }
  }

  const renderColumns = () => {
    const cols = orderedFields[activeSubTab] ?? [];
    return cols.map((c) => (
      <th key={c.key} className="whitespace-nowrap">{c.label}</th>
    ));
  };

  const openAdd = () => {
    setFormData({});
    setEditIndex(null);
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setFormData({ ...item });
    setEditIndex(item.id ?? null);
    setShowForm(true);
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // field definitions per subtab (key, label)
  const subtabFields: Record<string, Array<{ key: string; label: string }>> = {
    'sarana-prasarana': [
      { key: 'namaPrasarana', label: 'Nama Prasarana' },
      { key: 'dayaTampung', label: 'Daya Tampung' },
      { key: 'luasRuang', label: 'Luas Ruang (m²)' },
      { key: 'status', label: 'Status (M/W)' },
      { key: 'lisensi', label: 'Lisensi (L/P/T)' },
      { key: 'perangkat', label: 'Perangkat' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'hibah-dan-pembiayaan': [
      { key: 'namaDTPR', label: 'Nama DTPR' },
      { key: 'judulPenelitian', label: 'Judul Penelitian' },
      { key: 'jumlahMahasiswaTerlibat', label: 'Jumlah Mahasiswa Terlibat' },
      { key: 'jenisHibah', label: 'Jenis Hibah' },
      { key: 'sumber', label: 'Sumber' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaan', label: 'Pendanaan (Rp Juta)' },
      { key: 'tahun', label: 'Tahun' },
    ],
    'pengembangan-dtpr': [
      { key: 'namaDTPR', label: 'Nama DTPR' },
      { key: 'jenisPengembangan', label: 'Jenis Pengembangan' },
      { key: 'tahunAkademik', label: 'Tahun Akademik' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'kerjasama-penelitian': [
      { key: 'judulKerjasama', label: 'Judul Kerjasama' },
      { key: 'mitra', label: 'Mitra' },
      { key: 'sumber', label: 'Sumber' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaan', label: 'Pendanaan (Rp Juta)' },
      { key: 'tahun', label: 'Tahun' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'publikasi-penelitian': [
      { key: 'namaDTPR', label: 'Nama DTPR' },
      { key: 'judulPublikasi', label: 'Judul Publikasi' },
      { key: 'jenisPublikasi', label: 'Jenis Publikasi' },
      { key: 'tahun', label: 'Tahun' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'perolehan-hki': [
      { key: 'judul', label: 'Judul' },
      { key: 'jenisHKI', label: 'Jenis HKI' },
      { key: 'namaDTPR', label: 'Nama DTPR' },
      { key: 'tahun', label: 'Tahun' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
  };

  // Ordered fields (flat) used to render table headers and rows in a fixed order
  const orderedFields: Record<string, Array<{ key: string; label: string }>> = {
    'sarana-prasarana': subtabFields['sarana-prasarana'],
    'hibah-dan-pembiayaan': [
      { key: 'no', label: 'No' },
      { key: 'namaDTPR', label: 'Nama DTPR (Ketua)' },
      { key: 'judulPenelitian', label: 'Judul Penelitian' },
      { key: 'jumlahMahasiswaTerlibat', label: 'Jumlah Mahasiswa yang Terlibat' },
      { key: 'jenisHibah', label: 'Jenis Hibah Penelitian' },
      { key: 'sumber', label: 'Sumber (L/N/I)' },
      { key: 'durasi', label: 'Durasi (tahun)' },
      { key: 'pendanaan_ts2', label: 'TS-2' },
      { key: 'pendanaan_ts1', label: 'TS-1' },
      { key: 'pendanaan_ts', label: 'TS' },
      { key: 'linkBukti', label: 'Link Bukti' },
    ],
    'pengembangan-dtpr': subtabFields['pengembangan-dtpr'],
    'kerjasama-penelitian': subtabFields['kerjasama-penelitian'],
    'publikasi-penelitian': subtabFields['publikasi-penelitian'],
    'perolehan-hki': subtabFields['perolehan-hki'],
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);
      const payload = { type: activeSubTab, ...formData };
      let res;
      if (editIndex) {
        // update existing
        res = await fetch(`${API_BASE}/${activeSubTab}/${editIndex}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // create new
        res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
      }
      await res.json();
      await fetchData();
      setShowForm(false);
      setFormData({});
      setEditIndex(null);
    } catch (err: any) {
      console.error('save error', err);
      setErrorMsg(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const renderRows = () => {
    const cols = orderedFields[activeSubTab] ?? [];
    if (data.length === 0) {
      const placeholders = 5; // number of empty rows to show
      const emptyRows = [];
      for (let i = 0; i < placeholders; i++) {
        emptyRows.push(
          <tr key={`empty-${i}`} className="odd:bg-white even:bg-gray-50">
            {cols.map((c) => (
              <td key={c.key + '-empty-' + i} className="px-4 py-2 border-t text-gray-400">&nbsp;</td>
            ))}
            <td className="px-4 py-2 border-t text-center text-gray-400">&nbsp;</td>
          </tr>
        );
      }
      return emptyRows;
    }

    return data.map((item: any) => (
      <tr key={item.id ?? Math.random()} className="hover:bg-gray-50">
        {cols.map((c) => (
          <td key={c.key} className="px-4 py-2 border-t">
            {item[c.key] ?? ''}
          </td>
        ))}
        <td className="px-4 py-2 border-t text-center">
          <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2">
            <Edit size={16} />
          </button>
          <button onClick={async () => {
            if (!item.id) return;
            if (!confirm('Hapus data ini?')) return;
            try {
              setErrorMsg(null);
              const res = await fetch(`${API_BASE}/${activeSubTab}/${item.id}`, { method: 'DELETE' });
              if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
              }
              await res.json();
              await fetchData();
            } catch (err: any) {
              console.error('delete error', err);
              setErrorMsg(err?.message || String(err));
            }
          }} className="text-red-600 hover:text-red-800">
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex w-full bg-gray-100">
      <div className="flex-1 w-full">
        <main className="w-full p-4 md:p-6 max-w-full overflow-x-hidden">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-900" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Relevansi Penelitian</h1>
                <p className="text-sm text-gray-600">Kelola data kuantitatif berdasarkan kriteria akreditasi</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Download size={16} /> Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Save size={16} /> Save Draft
              </button>
            </div>
          </div>

          {/* Tabs utama */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  pathname === tab.href
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Subtabs */}
          <div className="flex gap-2 border-b pb-2 mb-4 overflow-x-auto">
            {[
              { key: 'sarana-prasarana', label: 'Sarana & Prasarana Penelitian' },
              { key: 'hibah-dan-pembiayaan', label: 'Hibah & Pembiayaan' },
              { key: 'pengembangan-dtpr', label: 'Pengembangan DTPR' },
              { key: 'kerjasama-penelitian', label: 'Kerjasama Penelitian' },
              { key: 'publikasi-penelitian', label: 'Publikasi Penelitian' },
              { key: 'perolehan-hki', label: 'Perolehan HKI' },
            ].map((sub) => (
              <button
                key={sub.key}
                onClick={() => setActiveSubTab(sub.key)}
                className={`px-4 py-2 text-sm rounded-t-lg ${
                  activeSubTab === sub.key
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 capitalize">Data {activeSubTab.replace('-', ' ')}</h3>
              <div className="flex gap-2">
              <button onClick={openAdd} className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-white bg-blue-700 rounded-lg hover:bg-blue-800">
                  <Plus size={16} /> Tambah Data
                </button>
                <form>
                  <label className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-100 cursor-pointer">
                      <Upload size={16} /> {importing ? 'Importing...' : 'Import Excel'}
                      <input onChange={handleFileChange} type="file" accept=".xlsx,.xls" className="hidden" />
                  </label>
                </form>
              </div>
            </div>
            <div className="overflow-x-auto">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 border-t border-red-100">
                  Error: {errorMsg}
                </div>
              )}
              <table className="w-full text-sm text-left text-gray-600 border-collapse table-auto">
                <thead className="bg-gray-100 text-gray-700 uppercase sticky top-0">
                  <tr>
                    {renderColumns()}
                    <th className="whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm">{renderRows()}</tbody>
              </table>
            </div>
          </div>

          {/* Form (Modal) */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                {/* Modal: responsive sizing for small screens */}
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editIndex !== null ? 'Edit Data' : 'Tambah Data Baru'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-gray-500">Form input dinamis akan disesuaikan berdasarkan subtab aktif.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(subtabFields[activeSubTab] || []).map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm text-gray-700 mb-1">{f.label}</label>
                      <input
                        name={f.key}
                        value={formData[f.key] ?? ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  ))}

                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                    type="button"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                    type="button"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview & Mapping Modal */}
          {showPreviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Preview Import — mapping kolom</h3>
                  <button onClick={() => setShowPreviewModal(false)} className="text-gray-500">Tutup</button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Sesuaikan mapping kolom Excel ke field internal. Contoh: "Nama Dosen" → "namaDTPR".</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex gap-2 mb-2">
                    <button onClick={applySuggestions} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Auto Map</button>
                    <button onClick={savePresetForSubtab} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">Simpan Preset</button>
                    <button onClick={loadPresetForSubtab} className="px-3 py-1 bg-gray-200 text-sm rounded">Load Preset</button>
                    <div className="text-sm text-gray-500 self-center">(Auto Map pakai saran otomatis; Save preset untuk pakai lagi)</div>
                  </div>
                  {previewHeaders.map((h) => (
                    <div key={h} className="flex gap-3 items-center">
                      <div className="min-w-[160px] text-sm font-medium">{h}</div>
                      <select value={mapping[h] ?? ''} onChange={(e) => setMapping({ ...mapping, [h]: e.target.value })} className="border px-2 py-1">
                        <option value="">-- tidak dipetakan --</option>
                        {/* show suggestion first */}
                        {Object.values(suggestions).filter(Boolean).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        {/* show internal keys from orderedFields */}
                        {(orderedFields[activeSubTab] || []).map((f) => (
                          <option key={f.key} value={f.key}>{f.key}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold mb-2">Contoh baris:</div>
                  <div className="overflow-x-auto border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>{previewHeaders.map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {previewRows.map((r, idx) => (
                          <tr key={idx} className="odd:bg-white even:bg-gray-50">
                            {previewHeaders.map((h) => (
                              <td key={h} className="px-2 py-1">{String(r[h] ?? '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                  <button onClick={commitImport} className="px-4 py-2 bg-blue-700 text-white rounded">Import dan Simpan</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );

  // return number of data columns (without the final 'Aksi' column) for each subtab
  function getColumnCount() {
    const cols = orderedFields[activeSubTab] ?? [];
    return cols.length;
  }
}
