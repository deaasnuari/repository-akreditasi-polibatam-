// app/export-akreditasi/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalBagian: number;
  siapExport: number;
  belumLengkap: number;
}

interface BagianAkreditasi {
  id: number;
  kode_bagian: string;
  nama_bagian: string;
  deskripsi: string;
  tanggal_update: string;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ExportAkreditasi() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBagian: 0,
    siapExport: 0,
    belumLengkap: 0,
  });
  const [bagianList, setBagianList] = useState<BagianAkreditasi[]>([]);
  const [filteredBagian, setFilteredBagian] = useState<BagianAkreditasi[]>([]);
  const [selectedBagian, setSelectedBagian] = useState<number[]>([]);
  const [exportFormat, setExportFormat] = useState<string>('PDF');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBagianData();
  }, [bagianList, filterStatus, searchQuery]);

  // Ambil data real dari bukti pendukung dan hitung statistik
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/bukti-pendukung/rekap-bagian`, { credentials: 'include' });
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.warn('Rekap-bagian bukan array, respons:', data);
        setStats({ totalBagian: 0, siapExport: 0, belumLengkap: 0 });
        setBagianList([]);
        setFilteredBagian([]);
        return;
      }

      // ✅ Expand item generic "relevansi" menjadi 3 item terpisah
      const expandedData: BagianAkreditasi[] = [];
      let nextId = Math.max(...data.map((d: any) => d.id), 0) + 1000; // ID virtual untuk item expanded
      
      // Fetch LED data untuk cek tab mana yang ada
      const userIdStr = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
      let availableLEDTabs: string[] = [];
      
      if (userIdStr) {
        try {
          const ledRes = await fetch(`${API_URL}/led/${userIdStr}`, { credentials: 'include' });
          if (ledRes.ok) {
            const ledData = await ledRes.json();
            availableLEDTabs = Object.keys(ledData).filter(key => 
              ledData[key] && typeof ledData[key] === 'object' && Object.keys(ledData[key]).length > 0
            );
            console.log('📦 Available LED tabs:', availableLEDTabs);
          }
        } catch (e) {
          console.warn('Could not fetch LED data:', e);
        }
      }

      for (const item of data) {
        const code = (item.kode_bagian || '').toLowerCase().trim();
        const name = (item.nama_bagian || '').toLowerCase().trim();
        
        // Jika item adalah generic "relevansi", expand menjadi 3 item
        if ((code === 'led' || code.includes('led')) && 
            name === 'relevansi' &&
            !name.includes('pendidikan') && 
            !name.includes('penelitian') && 
            !name.includes('pkm')) {
          
          console.log('🔄 Expanding generic "Relevansi" item into 3 separate items');
          
          // Buat 3 item terpisah untuk setiap tab Relevansi yang ada datanya
          const relevansiTabs = [
            { key: 'relevansi-pendidikan', code: 'C.2', name: 'Relevansi Pendidikan' },
            { key: 'relevansi-penelitian', code: 'C.3', name: 'Relevansi Penelitian' },
            { key: 'relevansi-pkm', code: 'C.4', name: 'Relevansi PkM' }
          ];
          
          relevansiTabs.forEach(tab => {
            // Hanya tambahkan jika ada data di LED
            if (availableLEDTabs.includes(tab.key)) {
              expandedData.push({
                id: nextId++,
                kode_bagian: `LED ${tab.code}`,
                nama_bagian: tab.name,
                deskripsi: `${tab.name} - Data dari LED Database`,
                tanggal_update: item.tanggal_update,
                status: 'Siap Export',
                type: item.type,
                // Tambahkan flag untuk identifikasi nanti
                _isExpandedLED: true,
                _ledTabKey: tab.key
              } as any);
            }
          });
        } else {
          // Item normal, masukkan langsung
          expandedData.push(item);
        }
      }

      const totalBagian = expandedData.length;
      const siapExport = expandedData.filter((b: BagianAkreditasi) => (b.status || '').toLowerCase() === 'siap export').length;
      const belumLengkap = expandedData.filter((b: BagianAkreditasi) => (b.status || '').toLowerCase() === 'belum lengkap').length;

      setStats({ totalBagian, siapExport, belumLengkap });
      setBagianList(expandedData as BagianAkreditasi[]);
      setFilteredBagian(expandedData as BagianAkreditasi[]);
    } catch (e) {
      console.error('Gagal memuat data bukti pendukung:', e);
      setStats({ totalBagian: 0, siapExport: 0, belumLengkap: 0 });
      setBagianList([]);
      setFilteredBagian([]);
    }
  };

  const filterBagianData = () => {
    let filtered = [...bagianList];

    if (filterStatus) {
      filtered = filtered.filter((b) => (b.status || '').toLowerCase() === filterStatus.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.nama_bagian.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.kode_bagian.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBagian(filtered);
  };

  const handleBagianToggle = (id: number) => {
    setSelectedBagian((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBagian.length === filteredBagian.length) {
      setSelectedBagian([]);
    } else {
      setSelectedBagian(filteredBagian.map((b) => b.id));
    }
  };

  // Helper function untuk cek apakah item adalah LED
  const isLEDItem = (item: BagianAkreditasi) => {
    const name = String(item?.nama_bagian || '').toLowerCase().trim();
    const code = String(item?.kode_bagian || '').toLowerCase().trim();
    
    // Normalize spaces and special characters
    const normalizeName = name.replace(/\s+/g, ' ');
    const normalizeCode = code.replace(/\s+/g, '');
    
    // Check for LED patterns in BOTH code and name
    const isLED = 
      // ✅ Check in CODE first
      normalizeCode.includes('led') || normalizeCode === 'led' ||
      normalizeCode.includes('c.1') || normalizeCode.includes('c1') ||
      normalizeCode.includes('c.2') || normalizeCode.includes('c2') ||
      normalizeCode.includes('c.3') || normalizeCode.includes('c3') ||
      normalizeCode.includes('c.4') || normalizeCode.includes('c4') ||
      normalizeCode.includes('c.5') || normalizeCode.includes('c5') ||
      normalizeCode.includes('c.6') || normalizeCode.includes('c6') ||
      // ✅ Check in NAME - C.1 Budaya Mutu
      normalizeName.includes('led') || 
      normalizeName.includes('laporan evaluasi diri') ||
      normalizeName.includes('budaya mutu') || 
      normalizeName.includes('budaya-mutu') || 
      normalizeName.includes('budayamutu') ||
      (normalizeName.includes('budaya') && !normalizeName.includes('non')) ||
      // ✅ C.2 Relevansi Pendidikan
      normalizeName.includes('relevansi pendidikan') ||
      normalizeName.includes('relevansi-pendidikan') ||
      normalizeName.includes('relevansipendidikan') ||
      (normalizeName.includes('pendidikan') && normalizeName.includes('relevansi')) ||
      // ✅ C.3 Relevansi Penelitian
      normalizeName.includes('relevansi penelitian') ||
      normalizeName.includes('relevansi-penelitian') ||
      normalizeName.includes('relevansipenelitian') ||
      (normalizeName.includes('penelitian') && normalizeName.includes('relevansi')) ||
      // ✅ C.4 Relevansi PKM/UKM
      normalizeName.includes('relevansi pkm') ||
      normalizeName.includes('relevansi-pkm') ||
      normalizeName.includes('relevansipkm') ||
      normalizeName.includes('relevansi pengabdian') ||
      normalizeName.includes('relevansi ukm') ||
      normalizeName.includes('relevansi-ukm') ||
      (normalizeName.includes('pkm') && normalizeName.includes('relevansi')) ||
      (normalizeName.includes('pengabdian') && normalizeName.includes('relevansi')) ||
      (normalizeName.includes('ukm') && normalizeName.includes('relevansi')) ||
      // ✅ C.5 Akuntabilitas
      normalizeName.includes('akuntabilitas') ||
      normalizeName.includes('akuntabilitas-') ||
      // ✅ C.6 Diferensiasi Misi
      normalizeName.includes('diferensiasi misi') ||
      normalizeName.includes('diferensiasi-misi') ||
      normalizeName.includes('diferensiasimisi') ||
      normalizeName.includes('diferensiasi');
    
    console.log(`[LED Detection] ${code} - ${name.substring(0, 30)}... => ${isLED ? '✓ LED' : '✗ Non-LED'}`);
    return isLED;
  };

  // Helper function untuk mendapatkan tab key LED
  const getLEDTabKey = (bagian: BagianAkreditasi): string | null => {
    const code = (bagian.kode_bagian || '').toLowerCase().trim().replace(/\s+/g, '');
    const name = (bagian.nama_bagian || '').toLowerCase().trim().replace(/\s+/g, ' ');
    
    console.log(`[Tab Mapping] Checking: code="${code}", name="${name}"`);
    
    // ⚠️ SPECIAL CASE: Jika nama hanya "relevansi" tanpa spesifik
    if ((code.includes('led') || code === 'led') && 
        name === 'relevansi' && 
        !name.includes('pendidikan') && 
        !name.includes('penelitian') && 
        !name.includes('pkm') &&
        !name.includes('pengabdian')) {
      console.log(`⚠️ [Tab Key] Item generic "relevansi" detected - need user input`);
      // Return null untuk trigger alert dengan pilihan manual
      return null;
    }
    
    // ⚠️ CHECK C.2 FIRST (lebih spesifik: "pendidikan" harus sebelum "budaya")
    // C.2 - Relevansi Pendidikan
    if (code.includes('c.2') || code.includes('c2') || 
        name.includes('relevansi pendidikan') ||
        name.includes('relevansi-pendidikan') ||
        name.includes('relevansipendidikan') ||
        name.includes('pendidikan') ||
        (code.includes('led') && name.includes('pendidikan')) ||
        (name.includes('pendidikan') && !name.includes('penelitian') && !name.includes('non'))) {
      console.log(`[Tab Key] ✅ Mapped to: relevansi-pendidikan (code: "${code}", name: "${name.substring(0, 50)}...")`);
      return 'relevansi-pendidikan';
    }
    
    // C.1 - Budaya Mutu (termasuk kode "LED" dengan nama budaya mutu)
    if (code.includes('c.1') || code.includes('c1') || 
        name.includes('budaya mutu') || name.includes('budayamutu') || 
        name.includes('budaya-mutu') || 
        (code.includes('led') && name.includes('budaya')) ||
        (name.includes('budaya') && !name.includes('non'))) {
      console.log(`[Tab Key] ✅ Mapped to: budaya-mutu (code: "${code}", name: "${name.substring(0, 50)}...")`);
      return 'budaya-mutu';
    }
    // C.3 - Relevansi Penelitian
    if (code.includes('c.3') || code.includes('c3') || 
        name.includes('relevansi penelitian') ||
        name.includes('relevansi-penelitian') ||
        name.includes('relevansipenelitian') ||
        name.includes('penelitian') ||
        (code.includes('led') && name.includes('penelitian'))) {
      console.log(`[Tab Key] ✅ Mapped to: relevansi-penelitian (code: "${code}", name: "${name.substring(0, 50)}...")`);
      return 'relevansi-penelitian';
    }
    // C.4 - Relevansi PKM/UKM
    if (code.includes('c.4') || code.includes('c4') || 
        name.includes('relevansi pkm') || 
        name.includes('relevansi-pkm') ||
        name.includes('relevansipkm') ||
        name.includes('relevansi pengabdian') ||
        name.includes('relevansi ukm') ||
        name.includes('relevansi-ukm') ||
        name.includes('pkm') ||
        name.includes('pengabdian') ||
        name.includes('ukm') ||
        (code.includes('led') && (name.includes('pkm') || name.includes('pengabdian') || name.includes('ukm')))) {
      console.log(`[Tab Key] ✅ Mapped to: relevansi-pkm (code: "${code}", name: "${name.substring(0, 50)}...")`);
      return 'relevansi-pkm';
    }
    // C.5 - Akuntabilitas
    if (code.includes('c.5') || code.includes('c5') || 
        name.includes('akuntabilitas') ||
        (code.includes('led') && name.includes('akuntabilitas'))) {
      console.log(`[Tab Key] ✅ Mapped to: akuntabilitas`);
      return 'akuntabilitas';
    }
    // C.6 - Diferensiasi Misi
    if (code.includes('c.6') || code.includes('c6') || 
        name.includes('diferensiasi misi') || 
        name.includes('diferensiasi-misi') ||
        name.includes('diferensiasimisi') ||
        name.includes('diferensiasi') ||
        (code.includes('led') && name.includes('diferensiasi'))) {
      console.log(`[Tab Key] ✅ Mapped to: diferensiasi-misi`);
      return 'diferensiasi-misi';
    }
    
    console.log(`[Tab Key] ⚠️ No mapping found for: ${code} - ${name}`);
    return null;
  };

  // Export LED ke PDF dengan data dari database
  const handleExportLEDPDF = async (bagian: BagianAkreditasi) => {
    try {
      // ✅ Check jika item sudah expanded dengan _ledTabKey
      let tabKey = (bagian as any)._ledTabKey || getLEDTabKey(bagian);
      
      if (!tabKey) {
        alert(`Tidak dapat menentukan tipe LED untuk bagian "${bagian.nama_bagian}".\n\n` +
              `Pastikan nama bagian mengandung kata kunci seperti:\n` +
              `- Budaya Mutu (C.1)\n` +
              `- Relevansi Pendidikan (C.2)\n` +
              `- Relevansi Penelitian (C.3)\n` +
              `- Relevansi PKM (C.4)\n` +
              `- Akuntabilitas (C.5)\n` +
              `- Diferensiasi Misi (C.6)`);
        return;
      }
      
      const userIdStr = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
      const userId = userIdStr ? Number(userIdStr) : null;
      
      if (!userId) {
        alert("User ID tidak ditemukan. Silakan login ulang.");
        return;
      }
      
      // Ambil data LED yang sudah disimpan di database (saved/draft)
      console.log('=== LED PDF EXPORT ===');
      console.log(`🔵 Bagian: ${bagian.kode_bagian} - ${bagian.nama_bagian}`);
      console.log(`🔵 Tab Key: ${tabKey}`);
      console.log(`🔵 User ID: ${userId}`);
      console.log(`🔵 Fetching from: ${API_URL}/led/${userId}`);
      console.log('📊 Data source: TABLE led (database)');
      
      const response = await fetch(`${API_URL}/led/${userId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        throw new Error('Gagal mengambil data LED dari database');
      }
      
      const allData = await response.json();
      console.log('✅ Response received');
      console.log('📦 Available subtabs:', Object.keys(allData));
      console.log(`🔍 Looking for tabKey: "${tabKey}"`);
      
      const ledData = allData[tabKey];
      
      console.log(`🔍 Checking LED data for "${tabKey}"...`);
      console.log(`   Type: ${typeof ledData}`);
      console.log(`   Is null: ${ledData === null}`);
      console.log(`   Is undefined: ${ledData === undefined}`);
      console.log(`   Data:`, ledData);
      
      if (!ledData || ledData === null) {
        console.warn(`⚠️ No data found for tabKey: "${tabKey}"`);
        console.log('💡 Available subtabs in response:', Object.keys(allData));
        console.log('💡 Full response data:', JSON.stringify(allData, null, 2));
        alert(`❌ Data LED untuk "${bagian.nama_bagian}" belum tersedia di database.\n\n` +
              `Silakan:\n` +
              `1. Buka halaman LED → ${bagian.nama_bagian}\n` +
              `2. Isi data (Penetapan, Pelaksanaan, Evaluasi)\n` +
              `3. Klik SAVE atau DRAFT\n` +
              `4. Kembali ke halaman Export dan coba lagi\n\n` +
              `Subtab yang ada: ${Object.keys(allData).join(', ') || 'Tidak ada'}`);
        return;
      }
      
      if (typeof ledData === 'object' && Object.keys(ledData).length === 0) {
        console.warn(`⚠️ Data for "${tabKey}" exists but is empty object`);
        alert(`❌ Data LED untuk "${bagian.nama_bagian}" kosong di database.\n\nSilakan isi data terlebih dahulu di halaman LED.`);
        return;
      }
      
      console.log(`✅ LED data found for "${tabKey}"`);
      console.log(`📊 Data keys: [${Object.keys(ledData).join(', ')}]`);
      console.log(`📊 Data structure:`, JSON.stringify(Object.keys(ledData).reduce((acc: any, key) => {
        acc[key] = Array.isArray(ledData[key]) ? `Array(${ledData[key].length})` : typeof ledData[key];
        return acc;
      }, {}), null, 2));
      console.log('🖨️ Generating PDF...');
      
      generateLEDPDF(ledData, tabKey, bagian.nama_bagian);
      
      console.log('✅ PDF generation completed');
    } catch (error) {
      console.error("❌ Error export LED PDF:", error);
      alert(`❌ Gagal export PDF LED.\n\n` +
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
            `Pastikan:\n` +
            `1. Data LED sudah disimpan di database\n` +
            `2. Backend server berjalan\n` +
            `3. Anda sudah login`);
    }
  };

  // Export SEMUA tab Relevansi yang ada datanya (untuk item generic "relevansi")
  const handleExportAllRelevansi = async (bagian: BagianAkreditasi) => {
    try {
      console.log('=== AUTO-EXPORT ALL RELEVANSI ===');
      
      const userIdStr = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
      const userId = userIdStr ? Number(userIdStr) : null;
      
      if (!userId) {
        alert("User ID tidak ditemukan. Silakan login ulang.");
        return;
      }
      
      console.log(`🔵 Fetching all LED data for user ${userId}...`);
      const response = await fetch(`${API_URL}/led/${userId}`, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data LED dari database');
      }
      
      const allData = await response.json();
      console.log('📦 Available subtabs:', Object.keys(allData));
      
      // Tab relevansi yang akan dicek
      const relevansiTabs = [
        { key: 'relevansi-pendidikan', label: 'C.2 Relevansi Pendidikan' },
        { key: 'relevansi-penelitian', label: 'C.3 Relevansi Penelitian' },
        { key: 'relevansi-pkm', label: 'C.4 Relevansi PkM' }
      ];
      
      // Filter tab yang ada datanya
      const tabsToExport = relevansiTabs.filter(tab => {
        const data = allData[tab.key];
        const hasData = data && typeof data === 'object' && Object.keys(data).length > 0;
        console.log(`   ${tab.key}: ${hasData ? '✅ Ada data' : '❌ Tidak ada data'}`);
        return hasData;
      });
      
      if (tabsToExport.length === 0) {
        alert(`❌ Tidak ada data Relevansi yang sudah di-save di database.\n\n` +
              `Silakan:\n` +
              `1. Buka halaman LED\n` +
              `2. Pilih tab Relevansi (Pendidikan/Penelitian/PKM)\n` +
              `3. Isi data dan klik SAVE/DRAFT\n` +
              `4. Kembali ke halaman Export dan coba lagi`);
        return;
      }
      
      console.log(`✅ Found ${tabsToExport.length} tab(s) with data`);
      
      // ✅ Gabungkan semua dalam 1 PDF untuk menghindari popup blocker
      console.log('🖨️ Generating combined PDF with all Relevansi tabs...');
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("❌ Popup diblokir oleh browser.\n\n" +
              "Solusi:\n" +
              "1. Klik icon 🔒 di address bar\n" +
              "2. Izinkan popup untuk situs ini\n" +
              "3. Refresh halaman dan coba lagi");
        return;
      }
      
      // Gabungkan HTML semua tab
      let combinedHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>LED - Relevansi (Semua Tab)</title>
          <style>
            @page { size: A4 landscape; margin: 1.5cm; }
            @media print {
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
            body { font-family: Arial, sans-serif; font-size: 10pt; margin: 20px; }
            .document-header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #000; padding-bottom: 15px; }
            .document-header h1 { margin: 10px 0; font-size: 16pt; font-weight: bold; color: #000; }
            .document-header h2 { margin: 5px 0; font-size: 12pt; font-weight: normal; color: #333; }
            .section-header { background-color: #f0f0f0; padding: 10px; font-weight: bold; font-size: 11pt; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #000; }
            .table-wrapper { margin-bottom: 20px; }
            .table-title { font-weight: bold; margin-bottom: 5px; font-size: 10pt; color: #333; }
            .data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .data-table th, .data-table td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; font-size: 9pt; line-height: 1.3; }
            .data-table th { background-color: #e0e0e0; font-weight: bold; text-align: center; }
            .data-table tbody tr:nth-child(even) td { background-color: #fafafa; }
            .data-table tbody tr:nth-child(odd) td { background-color: #ffffff; }
            .document-footer { text-align: center; font-size: 9pt; margin-top: 30px; padding-top: 15px; border-top: 2px solid #000; }
            .document-footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="document-header">
            <h1>LAPORAN EVALUASI DIRI - RELEVANSI</h1>
            <h2>Politeknik Negeri Batam</h2>
            <p style="font-size: 10pt; margin-top: 10px;">Mencakup: ${tabsToExport.map(t => t.label).join(', ')}</p>
          </div>
      `;
      
      // Generate HTML untuk setiap tab
      tabsToExport.forEach((tab, index) => {
        const ledData = allData[tab.key];
        const tabHTML = generateLEDTabHTML(ledData, tab.key, tab.label);
        
        // Tambahkan page break kecuali tab pertama
        if (index > 0) {
          combinedHTML += '<div class="page-break"></div>';
        }
        
        combinedHTML += tabHTML;
      });
      
      // Footer
      combinedHTML += `
          <div class="document-footer">
            <p><strong>Politeknik Negeri Batam</strong></p>
            <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(combinedHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
      console.log('✅ Combined Relevansi PDF generated');
      
    } catch (error) {
      console.error("❌ Error export All Relevansi:", error);
      alert(`❌ Gagal export Relevansi.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateLEDPDF = (data: any, tabKey: string, title: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup diblokir. Silakan izinkan popup untuk export PDF.");
      return;
    }
    
    const htmlContent = generateLEDHTML(data, tabKey, title);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Generate HTML untuk 1 tab saja (tanpa wrapper HTML document)
  const generateLEDTabHTML = (data: any, tabKey: string, title: string) => {
    const tabLabels: Record<string, string> = {
      "budaya-mutu": "C.1 Budaya Mutu",
      "relevansi-pendidikan": "C.2 Relevansi Pendidikan",
      "relevansi-penelitian": "C.3 Relevansi Penelitian",
      "relevansi-pkm": "C.4 Relevansi PkM",
      "akuntabilitas": "C.5 Akuntabilitas",
      "diferensiasi-misi": "C.6 Diferensiasi Misi",
    };
    
    const tabLabel = tabLabels[tabKey] || title;
    const extendedTabs = ['budaya-mutu', 'relevansi-pendidikan', 'relevansi-penelitian', 'relevansi-pkm', 'akuntabilitas'];
    const isExtended = extendedTabs.includes(tabKey);
    
    const renderTable2Col = (rows: any[], tableName: string, extended: boolean = false) => {
      if (!rows || rows.length === 0) return "";
      
      return `
        <div class="table-wrapper">
          <h3 class="table-title">${tableName}</h3>
          <table class="data-table">
            <thead>
              <tr>
                ${extended ? 
                  '<th style="width: 25%;">Pernyataan Standar</th><th style="width: 25%;">Indikator</th><th style="width: 25%;">Pelaksanaan</th><th style="width: 25%;">Bukti Pendukung</th>' :
                  '<th style="width: 50%;">Pernyataan Standar</th><th style="width: 50%;">Indikator</th>'
                }
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => extended ? 
                `<tr>
                  <td>${r.pernyataan || '-'}</td>
                  <td>${r.keterlaksanaan || '-'}</td>
                  <td>${r.pelaksanaan || '-'}</td>
                  <td>${r.bukti_pendukung || '-'}</td>
                </tr>` :
                `<tr>
                  <td>${r.pernyataan || '-'}</td>
                  <td>${r.keterlaksanaan || '-'}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </div>
      `;
    };
    
    const renderTableEval = (rows: any[], tableName: string) => {
      if (!rows || rows.length === 0) return "";
      
      return `
        <div class="table-wrapper">
          <h3 class="table-title">${tableName}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 15%;">Pernyataan Standar</th>
                <th style="width: 15%;">Indikator</th>
                <th style="width: 20%;">Evaluasi</th>
                <th style="width: 25%;">Tindak Lanjut</th>
                <th style="width: 25%;">Hasil Optimalisasi</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => `
                <tr>
                  <td>${r.pernyataan || '-'}</td>
                  <td>${r.keterlaksanaan || '-'}</td>
                  <td>${r.evaluasi || '-'}</td>
                  <td>${r.tindak_lanjut || '-'}</td>
                  <td>${r.hasil_optimalisasi || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };
    
    return `
      <div style="margin-bottom: 40px;">
        <h2 style="text-align: center; font-size: 14pt; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
          ${tabLabel}
        </h2>
        
        <div class="section-header">1. PENETAPAN</div>
        ${renderTable2Col(data.penetapanA, "Penetapan - Tabel A", false)}
        ${renderTable2Col(data.penetapanB, "Penetapan - Tabel B", false)}
        ${data.penetapanC && data.penetapanC.length > 0 ? renderTable2Col(data.penetapanC, "Penetapan - Tabel C", false) : ''}
        ${data.penetapanD && data.penetapanD.length > 0 ? renderTable2Col(data.penetapanD, "Penetapan - Tabel D", false) : ''}
        
        <div class="section-header">2. PELAKSANAAN</div>
        ${renderTable2Col(data.pelaksanaanA, "Pelaksanaan - Tabel A", isExtended)}
        ${renderTable2Col(data.pelaksanaanB, "Pelaksanaan - Tabel B", isExtended)}
        ${data.pelaksanaanC && data.pelaksanaanC.length > 0 ? renderTable2Col(data.pelaksanaanC, "Pelaksanaan - Tabel C", isExtended) : ''}
        ${data.pelaksanaanD && data.pelaksanaanD.length > 0 ? renderTable2Col(data.pelaksanaanD, "Pelaksanaan - Tabel D", isExtended) : ''}
        
        <div class="section-header">3. EVALUASI, PENGENDALIAN, DAN PENINGKATAN</div>
        ${data.evalRows ? renderTableEval(data.evalRows, "Evaluasi, Pengendalian, Peningkatan - Tabel Evaluasi") : ''}
        ${data.evalA ? renderTableEval(data.evalA, "Evaluasi, Pengendalian, Peningkatan - Tabel A") : ''}
        ${data.evalB ? renderTableEval(data.evalB, "Evaluasi, Pengendalian, Peningkatan - Tabel B") : ''}
        ${data.evalC ? renderTableEval(data.evalC, "Evaluasi, Pengendalian, Peningkatan - Tabel C") : ''}
      </div>
    `;
  };

  const generateLEDHTML = (data: any, tabKey: string, title: string) => {
    const tabLabels: Record<string, string> = {
      "budaya-mutu": "C.1 Budaya Mutu",
      "relevansi-pendidikan": "C.2 Relevansi Pendidikan",
      "relevansi-penelitian": "C.3 Relevansi Penelitian",
      "relevansi-pkm": "C.4 Relevansi PkM",
      "akuntabilitas": "C.5 Akuntabilitas",
      "diferensiasi-misi": "C.6 Diferensiasi Misi",
    };
    
    const tabLabel = tabLabels[tabKey] || title;
    const extendedTabs = ['budaya-mutu', 'relevansi-pendidikan', 'relevansi-penelitian', 'relevansi-pkm', 'akuntabilitas'];
    const isExtended = extendedTabs.includes(tabKey);
    
    const renderTable2Col = (rows: any[], tableName: string, extended: boolean = false) => {
      if (!rows || rows.length === 0) return "";
      
      return `
        <div class="table-wrapper">
          <h3 class="table-title">${tableName}</h3>
          <table class="data-table">
            <thead>
              <tr>
                ${extended ? 
                  '<th style="width: 25%;">Pernyataan Standar</th><th style="width: 25%;">Indikator</th><th style="width: 25%;">Pelaksanaan</th><th style="width: 25%;">Bukti Pendukung</th>' :
                  '<th style="width: 50%;">Pernyataan Standar</th><th style="width: 50%;">Indikator</th>'
                }
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, idx) => `
                <tr>
                  <td>${idx + 1}. ${(r.pernyataan || '-').replace(/\n/g, '<br>')}</td>
                  <td>${(r.keterlaksanaan || '-').replace(/\n/g, '<br>')}</td>
                  ${extended ? `
                    <td>${(r.pelaksanaan || '-').replace(/\n/g, '<br>')}</td>
                    <td>${(r.bukti_pendukung || '-').replace(/\n/g, '<br>')}</td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };
    
    const renderTableEval = (rows: any[], tableName: string) => {
      if (!rows || rows.length === 0) return "";
      
      return `
        <div class="table-wrapper">
          <h3 class="table-title">${tableName}</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 20%;">Pernyataan Standar</th>
                <th style="width: 20%;">Indikator</th>
                <th style="width: 20%;">Evaluasi</th>
                <th style="width: 20%;">Tindak Lanjut</th>
                <th style="width: 20%;">Hasil Optimalisasi</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, idx) => `
                <tr>
                  <td>${idx + 1}. ${(r.pernyataan || '-').replace(/\n/g, '<br>')}</td>
                  <td>${(r.keterlaksanaan || '-').replace(/\n/g, '<br>')}</td>
                  <td>${(r.evaluasi || '-').replace(/\n/g, '<br>')}</td>
                  <td>${(r.tindak_lanjut || '-').replace(/\n/g, '<br>')}</td>
                  <td>${(r.hasil_optimalisasi || '-').replace(/\n/g, '<br>')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>LAPORAN EVALUASI DIRI - ${tabLabel}</title>
        <style>
          @page { 
            size: A4 landscape; 
            margin: 2cm 1.5cm; 
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
          }
          
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: Arial, Helvetica, sans-serif; 
            font-size: 10pt; 
            line-height: 1.4; 
            color: #000; 
          }
          
          .document-header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #000;
          }
          
          .document-header h1 { 
            font-size: 18pt; 
            font-weight: bold; 
            margin-bottom: 10px; 
            text-transform: uppercase;
          }
          
          .document-header h2 { 
            font-size: 14pt; 
            font-weight: bold;
            margin-top: 5px;
          }
          
          .section-header { 
            font-size: 12pt; 
            font-weight: bold; 
            margin: 25px 0 15px 0; 
            padding: 8px 12px;
            background-color: #f0f0f0;
            border-left: 5px solid #000;
            text-transform: uppercase;
            text-align: left;
          }
          
          .table-wrapper { 
            margin-bottom: 20px; 
            page-break-inside: avoid;
          }
          
          .table-title { 
            font-size: 11pt; 
            font-weight: bold; 
            margin-bottom: 8px; 
            padding: 5px 0;
            color: #000;
            text-align: left;
          }
          
          .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 10px;
          }
          
          .data-table th { 
            background-color: #e0e0e0;
            font-weight: bold; 
            padding: 10px 8px; 
            border: 1.5px solid #000; 
            text-align: center; 
            font-size: 10pt;
            vertical-align: middle;
          }
          
          .data-table td { 
            padding: 8px; 
            border: 1px solid #000; 
            vertical-align: top; 
            font-size: 9pt;
            line-height: 1.3;
          }
          
          .data-table tbody tr:nth-child(even) td { 
            background-color: #fafafa; 
          }
          
          .data-table tbody tr:nth-child(odd) td { 
            background-color: #ffffff; 
          }
          
          .document-footer { 
            text-align: center; 
            font-size: 9pt; 
            margin-top: 30px; 
            padding-top: 15px; 
            border-top: 2px solid #000; 
          }
          
          .document-footer p { 
            margin: 5px 0; 
          }
        </style>
      </head>
      <body>
        <div class="document-header">
          <h1>LAPORAN EVALUASI DIRI - ${tabLabel}</h1>
          <h2>Politeknik Negeri Batam</h2>
        </div>
        
        <div class="section-header">1. PENETAPAN</div>
        ${renderTable2Col(data.penetapanA, "Penetapan - Tabel A", false)}
        ${renderTable2Col(data.penetapanB, "Penetapan - Tabel B", false)}
        ${data.penetapanC && data.penetapanC.length > 0 ? renderTable2Col(data.penetapanC, "Penetapan - Tabel C", false) : ''}
        ${data.penetapanD && data.penetapanD.length > 0 ? renderTable2Col(data.penetapanD, "Penetapan - Tabel D", false) : ''}
        
        <div class="section-header page-break">2. PELAKSANAAN</div>
        ${renderTable2Col(data.pelaksanaanA, "Pelaksanaan - Tabel A", isExtended)}
        ${renderTable2Col(data.pelaksanaanB, "Pelaksanaan - Tabel B", isExtended)}
        ${data.pelaksanaanC && data.pelaksanaanC.length > 0 ? renderTable2Col(data.pelaksanaanC, "Pelaksanaan - Tabel C", isExtended) : ''}
        ${data.pelaksanaanD && data.pelaksanaanD.length > 0 ? renderTable2Col(data.pelaksanaanD, "Pelaksanaan - Tabel D", isExtended) : ''}
        
        <div class="section-header page-break">3. EVALUASI, PENGENDALIAN, DAN PENINGKATAN</div>
        ${data.evalRows ? renderTableEval(data.evalRows, "Evaluasi, Pengendalian, Peningkatan - Tabel Evaluasi") : ''}
        ${data.evalA ? renderTableEval(data.evalA, "Evaluasi, Pengendalian, Peningkatan - Tabel A") : ''}
        ${data.evalB ? renderTableEval(data.evalB, "Evaluasi, Pengendalian, Peningkatan - Tabel B") : ''}
        ${data.evalC ? renderTableEval(data.evalC, "Evaluasi, Pengendalian, Peningkatan - Tabel C") : ''}
        
        <div class="document-footer">
          <p><strong>Politeknik Negeri Batam</strong></p>
          <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleExport = async () => {
    if (selectedBagian.length === 0) {
      alert('Pilih minimal satu bagian untuk export');
      return;
    }

    const selectedItems = filteredBagian.filter((b) => selectedBagian.includes(b.id));
    
    console.log('\n'.repeat(3) + '='.repeat(80));
    console.log('🔍 EXPORT HANDLER - DEBUGGING INFO');
    console.log('='.repeat(80));
    console.log('Selected Item IDs:', selectedBagian);
    console.log('Export Format:', exportFormat);
    console.log('\n📋 SELECTED ITEMS DETAIL:');
    selectedItems.forEach((item, idx) => {
      const code = String(item.kode_bagian || '').toLowerCase().trim();
      const name = String(item.nama_bagian || '').toLowerCase().trim();
      const normalizeCode = code.replace(/\s+/g, '');
      const normalizeName = name.replace(/\s+/g, ' ');
      
      console.log(`\n--- Item ${idx + 1} ---`);
      console.log('  ID:', item.id);
      console.log('  Kode Asli:', item.kode_bagian);
      console.log('  Nama Asli:', item.nama_bagian);
      console.log('  Status:', item.status);
      console.log('  Kode Normalized:', normalizeCode);
      console.log('  Nama Normalized:', normalizeName);
      
      const checks = {
        'C.1/C1': normalizeCode.includes('c.1') || normalizeCode.includes('c1'),
        'C.2/C2': normalizeCode.includes('c.2') || normalizeCode.includes('c2'),
        'C.3/C3': normalizeCode.includes('c.3') || normalizeCode.includes('c3'),
        'C.4/C4': normalizeCode.includes('c.4') || normalizeCode.includes('c4'),
        'C.5/C5': normalizeCode.includes('c.5') || normalizeCode.includes('c5'),
        'C.6/C6': normalizeCode.includes('c.6') || normalizeCode.includes('c6'),
        'Budaya Mutu': normalizeName.includes('budaya mutu'),
        'Relevansi': normalizeName.includes('relevansi'),
        'Akuntabilitas': normalizeName.includes('akuntabilitas'),
        'Diferensiasi': normalizeName.includes('diferensiasi'),
        'LED': normalizeName.includes('led')
      };
      
      console.log('  LED Detection Checks:', checks);
      console.log('  ANY MATCH?', Object.values(checks).some(v => v));
    });
    
    // Pisahkan LED dan non-LED items
    const ledItems = selectedItems.filter(isLEDItem);
    const nonLedItems = selectedItems.filter(item => !isLEDItem(item));

    console.log('\n=== LED DETECTION RESULTS ===');
    console.log('Format:', exportFormat);
    console.log('Total selected:', selectedItems.length);
    console.log('LED items detected:', ledItems.length);
    if (ledItems.length > 0) {
      ledItems.forEach(item => {
        console.log('  ✓ LED:', item.kode_bagian, '-', item.nama_bagian);
      });
    }
    console.log('Non-LED items:', nonLedItems.length);
    if (nonLedItems.length > 0) {
      nonLedItems.forEach(item => {
        console.log('  ✗ Non-LED:', item.kode_bagian, '-', item.nama_bagian);
      });
    }

    // Jika format PDF dan ada item LED
    if (exportFormat === 'PDF' && ledItems.length > 0) {
      console.log('🔵 [PDF-LED] Exporting LED items as PDF with data from DATABASE...');
      for (const item of ledItems) {
        console.log(`   → Processing LED: ${item.kode_bagian} - ${item.nama_bagian}`);
        await handleExportLEDPDF(item);
        // Delay antar export untuk menghindari konflik
        if (ledItems.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log('✅ [PDF-LED] Finished exporting LED items');
      
      // Jika hanya ada LED, return dan JANGAN panggil endpoint akreditasi
      if (nonLedItems.length === 0) {
        console.log('ℹ️ No non-LED items, skipping akreditasi endpoint');
        return;
      }
      
      console.log('ℹ️ Found non-LED items, will also export non-LED data...');
    }

    // Export non-LED items atau Excel (untuk semua items)
    if (exportFormat === 'EXCEL' || (exportFormat === 'PDF' && nonLedItems.length > 0)) {
      const itemsToExport = exportFormat === 'EXCEL' ? selectedItems : nonLedItems;
      const idsToExport = itemsToExport.map(item => item.id);

      if (idsToExport.length === 0) {
        console.log('ℹ️ No items to export via akreditasi endpoint');
        return;
      }

      if (exportFormat === 'EXCEL') {
        console.log(`📊 [EXCEL] Exporting ALL items via akreditasi endpoint (TIDAK BERUBAH)...`);
        console.log(`   → Total items: ${itemsToExport.length}`);
        console.log(`   → IDs: [${idsToExport.join(', ')}]`);
        console.log(`   → Source: budaya_mutu table (LKPS data)`);
      } else {
        console.log(`🔵 [PDF-LKPS] Exporting non-LED items via akreditasi endpoint...`);
        console.log(`   → Items to export: ${itemsToExport.length}`);
        console.log(`   → IDs: [${idsToExport.join(', ')}]`);
        console.log(`   → WARNING: This will use data from budaya_mutu table (LKPS), NOT led table`);
      }

      setLoading(true);
      try {
        const endpoint = '/akreditasi/export';
        const res = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            format: exportFormat, 
            selectedIds: idsToExport,
            selectedTypes: []
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          console.error('\n❌ EXPORT FAILED!');
          console.error('Response Status:', res.status);
          console.error('Response Text:', res.statusText);
          console.error('Error Data:', errorData);
          console.error('Endpoint Called:', `${API_URL}/akreditasi/export`);
          console.error('Request Body:', { format: exportFormat, selectedIds: idsToExport, selectedTypes: [] });
          
          const errorMsg = errorData?.message || `Export gagal (${res.status}): ${res.statusText}`;
          alert(`❌ ${errorMsg}\n\nℹ️ Jika Anda mencoba export item LED (C.1-C.6), pastikan:\n1. Item terdeteksi sebagai LED (lihat console log)\n2. Data sudah disimpan di database LED`);
          throw new Error(errorMsg);
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `akreditasi-export-${Date.now()}.${exportFormat === 'PDF' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        console.log(`✅ [${exportFormat}] Export completed`);
      } catch (e) {
        console.error('❌ Export error:', e);
        alert(`Terjadi kesalahan saat export: ${e instanceof Error ? e.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'siap export':
        return 'bg-green-100 text-green-800';
      case 'belum lengkap':
        return 'bg-yellow-100 text-yellow-800';
            default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Export Data Akreditasi
          </h1>
          <p className="text-gray-600">
            Pilih bagian dan format untuk mengunduh data akreditasi
          </p>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Total Bagian */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 h-full">
              <div className="flex-shrink-0 rounded-md bg-gray-100 p-3">
                {/* Ikon dokumen stack */}
                <svg className="w-7 h-7 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h10.5a2.25 2.25 0 0 1 2.25 2.25v8.25a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V9.75A2.25 2.25 0 0 1 3.75 7.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5V6A2.25 2.25 0 0 1 9.75 3.75h10.5A2.25 2.25 0 0 1 22.5 6v8.25a2.25 2.25 0 0 1-2.25 2.25H18" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-gray-900 leading-tight">{stats.totalBagian}</div>
                <div className="text-sm text-gray-600">Total Bagian</div>
              </div>
            </div>

            {/* Siap Export */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-green-100 bg-green-50 h-full">
              <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                {/* Ikon check circle */}
                <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-green-700 leading-tight">{stats.siapExport}</div>
                <div className="text-sm text-green-700/80">Siap Export</div>
              </div>
            </div>

            {/* Belum Lengkap */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-yellow-100 bg-yellow-50 h-full">
              <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
                {/* Ikon clock */}
                <svg className="w-7 h-7 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v5.25l3.5 2.1" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold text-yellow-700 leading-tight">{stats.belumLengkap}</div>
                <div className="text-sm text-yellow-700/80">Belum Lengkap</div>
              </div>
            </div>

                      </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Step 1: Filter & Search */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Cari & Filter Bagian
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau kode bagian..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="Siap Export">Siap Export</option>
                <option value="Belum Lengkap">Belum Lengkap</option>
                              </select>
            </div>
          </div>

          <hr className="my-6" />

          {/* Step 2: Select Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Pilih Bagian ({selectedBagian.length}/{filteredBagian.length})
              </h2>
              <button onClick={handleSelectAll} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                {selectedBagian.length === filteredBagian.length ? 'Hapus Semua' : 'Pilih Semua'}
              </button>
            </div>

            {filteredBagian.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Tidak ada bagian yang ditemukan</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {filteredBagian.map((bagian) => (
                  <label
                    key={bagian.id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                      selectedBagian.includes(bagian.id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-white border-2 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBagian.includes(bagian.id)}
                      onChange={() => handleBagianToggle(bagian.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {bagian.kode_bagian} - {bagian.nama_bagian}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(bagian.status)}`}>
                          {bagian.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{bagian.deskripsi}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Diperbarui: {new Date(bagian.tanggal_update).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <hr className="my-6" />

          {/* Step 3: Export Settings */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Pilih Format Export
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format File</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="EXCEL">Excel Spreadsheet</option>
                </select>
              </div>
            </div>

            {/* Info LED Export */}
            {(() => {
              const selectedItems = filteredBagian.filter((b) => selectedBagian.includes(b.id));
              const ledItems = selectedItems.filter(isLEDItem);
              
              if (ledItems.length > 0 && exportFormat === 'PDF') {
                return (
                  <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">Export LED dari Database</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          Anda memilih <strong>{ledItems.length} item LED</strong>. Data LED akan diambil dari database (data yang sudah disimpan/draft).
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                          {ledItems.map((item) => (
                            <li key={item.id}>{item.kode_bagian} - {item.nama_bagian}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              }
              
              if (ledItems.length > 0 && exportFormat === 'EXCEL') {
                return (
                  <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-1">Export Excel untuk LED</h4>
                        <p className="text-sm text-yellow-800">
                          Anda memilih <strong>{ledItems.length} item LED</strong>. Export Excel akan menggunakan data LKPS dari tabel budaya_mutu. Untuk export LED dengan data dari database, gunakan format <strong>PDF</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return null;
            })()}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading || selectedBagian.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses Export...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {exportFormat} ({selectedBagian.length} Bagian)
              </>
            )}
          </button>

          {selectedBagian.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-3">
              Pilih minimal 1 bagian untuk melakukan export
            </p>
          )}
        </div>
      </div>
    </div>
  );
}