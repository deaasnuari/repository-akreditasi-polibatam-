// controllers/akreditasiController.js
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import XLSX from "xlsx";
import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templates = [
  { id: 1, nama_template: "Template BAN-PT", jenis_template: "PDF" },
  { id: 2, nama_template: "Template Internal", jenis_template: "Excel" },
];

// Helper function to generate HTML document for Docs export
const generateHTMLDocument = (recordsByType, prodi) => {
  const toTitleCase = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  const isEmpty = (val) => {
    if (val === null || val === undefined || val === '') return true;
    if (typeof val === 'string' && val.trim() === '') return true;
    if (Array.isArray(val) && val.length === 0) return true;
    if (typeof val === 'object' && Object.keys(val).length === 0) return true;
    return false;
  };

  const renderValue = (value) => {
    if (isEmpty(value)) return '<em style="color: #999;">-</em>';
    if (Array.isArray(value)) {
      if (value.every(item => typeof item !== 'object')) {
        return value.join(', ');
      }
      return value.map((item, idx) => {
        if (typeof item === 'object') {
          return `<div style="margin: 5px 0;"><strong>[${idx + 1}]</strong> ${Object.entries(item).map(([k, v]) => `${toTitleCase(k)}: ${v || '-'}`).join(', ')}</div>`;
        }
        return item;
      }).join('');
    }
    if (typeof value === 'object') {
      return Object.entries(value).map(([k, v]) => `<div style="margin: 3px 0;"><strong>${toTitleCase(k)}:</strong> ${renderValue(v)}</div>`).join('');
    }
    return String(value);
  };

  let htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LKPS Export - ${prodi || 'Politeknik Negeri Batam'}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      margin: 1in;
      color: #000;
    }
    h1 {
      text-align: center;
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 0.5em;
      border-bottom: 3px solid #000;
      padding-bottom: 0.5em;
    }
    h2 {
      font-size: 16pt;
      font-weight: bold;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.3em;
    }
    h3 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 1em;
      margin-bottom: 0.5em;
      color: #34495e;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    th {
      background-color: #3498db;
      color: white;
      padding: 10px;
      text-align: left;
      border: 1px solid #2c3e50;
      font-weight: bold;
    }
    td {
      padding: 8px;
      border: 1px solid #bdc3c7;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #ecf0f1;
    }
    .section {
      margin-bottom: 2em;
      page-break-inside: avoid;
    }
    .header-info {
      text-align: center;
      margin-bottom: 2em;
      font-size: 11pt;
      color: #7f8c8d;
    }
    .record-item {
      margin-bottom: 1.5em;
      padding: 1em;
      border: 1px solid #bdc3c7;
      border-radius: 5px;
      background-color: #f8f9fa;
      page-break-inside: avoid;
    }
    .field-name {
      font-weight: bold;
      color: #2c3e50;
      min-width: 150px;
      display: inline-block;
    }
    @media print {
      body { margin: 0.5in; }
      .record-item { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>DATA LKPS - LAPORAN AKREDITASI</h1>
  <div class="header-info">
    <p><strong>Politeknik Negeri Batam</strong></p>
    <p>Prodi: ${prodi || 'Semua Program Studi'}</p>
    <p>Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
`;

  // Process each type
  Object.keys(recordsByType).forEach(type => {
    const records = recordsByType[type];
    const sheetNameMap = {
      'tupoksi': 'Tupoksi',
      'pendanaan': 'Pendanaan',
      'penggunaan-dana': 'Penggunaan Dana',
      'ewmp': 'EWMP',
      'ktk': 'KTK',
      'spmi': 'SPMI',
      'mahasiswa': 'Mahasiswa',
      'keragaman-asal': 'Keragaman Asal',
      'kondisi-jumlah-mahasiswa': 'Kondisi Jumlah Mahasiswa',
      'tabel-pembelajaran': 'Tabel Pembelajaran',
      'pemetaan-cpl-pl': 'Pemetaan CPL-PL',
      'peta-pemenuhan-cpl': 'Peta Pemenuhan CPL',
      'rata-rata-masa-tunggu-lulusan': 'Rata-rata Masa Tunggu Lulusan',
      'kesesuaian-bidang': 'Kesesuaian Bidang',
      'kepuasan-pengguna': 'Kepuasan Pengguna',
      'fleksibilitas': 'Fleksibilitas',
      'rekognisi-apresiasi': 'Rekognisi dan Apresiasi',
      'relevansi-pendidikan': 'Relevansi Pendidikan',
      'relevansi-penelitian': 'Relevansi Penelitian',
      'relevansi-pkm': 'Relevansi PkM',
      'akuntabilitas': 'Akuntabilitas',
      'diferensiasi-misi': 'Diferensiasi Misi'
    };
    
    const sectionTitle = sheetNameMap[type.toLowerCase()] || toTitleCase(type);
    
    htmlContent += `\n  <div class="section">`;
    htmlContent += `\n    <h2>${sectionTitle}</h2>`;
    
    records.forEach((record, idx) => {
      const jsonData = record.data;
      if (!jsonData) return;
      
      htmlContent += `\n    <div class="record-item">`;
      htmlContent += `\n      <h3>Data ${idx + 1}</h3>`;
      htmlContent += `\n      <p><span class="field-name">Prodi:</span> ${record.prodi || '-'}</p>`;
      htmlContent += `\n      <p><span class="field-name">Tanggal Input:</span> ${record.created_at ? new Date(record.created_at).toLocaleDateString('id-ID') : '-'}</p>`;
      htmlContent += `\n      <p><span class="field-name">Tanggal Update:</span> ${record.updated_at ? new Date(record.updated_at).toLocaleDateString('id-ID') : '-'}</p>`;
      
      // Handle SPMI special case
      if (type === 'spmi' && Array.isArray(jsonData)) {
        jsonData.forEach((item, spmiIdx) => {
          const actualData = item.data || item;
          htmlContent += `\n      <div style="margin-top: 1em; padding: 0.5em; border-left: 3px solid #3498db;">`;
          htmlContent += `\n        <strong>Item ${spmiIdx + 1}</strong>`;
          Object.entries(actualData).forEach(([key, value]) => {
            if (!isEmpty(value)) {
              htmlContent += `\n        <p><span class="field-name">${toTitleCase(key)}:</span> ${renderValue(value)}</p>`;
            }
          });
          htmlContent += `\n      </div>`;
        });
      } 
      // Handle array data
      else if (Array.isArray(jsonData)) {
        htmlContent += `\n      <table>`;
        htmlContent += `\n        <thead><tr>`;
        
        // Get all unique keys from all items
        const allKeys = new Set();
        jsonData.forEach(item => {
          if (item && typeof item === 'object') {
            Object.keys(item).forEach(key => allKeys.add(key));
          }
        });
        
        Array.from(allKeys).forEach(key => {
          htmlContent += `<th>${toTitleCase(key)}</th>`;
        });
        htmlContent += `</tr></thead>`;
        htmlContent += `\n        <tbody>`;
        
        jsonData.forEach(item => {
          if (item && typeof item === 'object') {
            htmlContent += `\n          <tr>`;
            Array.from(allKeys).forEach(key => {
              htmlContent += `<td>${renderValue(item[key])}</td>`;
            });
            htmlContent += `</tr>`;
          }
        });
        
        htmlContent += `\n        </tbody>`;
        htmlContent += `\n      </table>`;
      }
      // Handle single object
      else if (typeof jsonData === 'object') {
        Object.entries(jsonData).forEach(([key, value]) => {
          if (!isEmpty(value)) {
            htmlContent += `\n      <p><span class="field-name">${toTitleCase(key)}:</span> ${renderValue(value)}</p>`;
          }
        });
      }
      
      htmlContent += `\n    </div>`;
    });
    
    htmlContent += `\n  </div>`;
  });

  htmlContent += `\n</body>\n</html>`;
  
  return htmlContent;
};

// ---------- GET /api/akreditasi/stats ----------
export const getStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    // Ambil data dari database
    const items = await prisma.buktiPendukung.findMany({
      where: { userId },
    });

    // Kelompokkan dan hitung status
    const groups = new Map();
    for (const it of items) {
      let kode = 'UNK';
      if (typeof it.nama === 'string' && it.nama.includes('-')) {
        const parts = it.nama.split('-').map(s => s.trim());
        if (parts.length >= 2) kode = parts[0];
      }
      const key = kode;
      const current = groups.get(key) || { statusRaw: [] };
      current.statusRaw.push((it.status || '').toLowerCase());
      groups.set(key, current);
    }

    // Tentukan status tiap bagian
    let siapExport = 0;
    let belumLengkap = 0;
    for (const [key, group] of groups) {
      const allLower = group.statusRaw.map(s => String(s || '').toLowerCase());
      const allLengkap = allLower.every(s => s === 'lengkap' || s === 'complete' || s === 'siap export');
      if (allLengkap) siapExport++;
      else belumLengkap++;
    }

    const totalBagian = groups.size;
    const kelengkapan = totalBagian > 0 ? Math.round((siapExport / totalBagian) * 100) : 0;

    res.json({
      totalBagian,
      siapExport,
      belumLengkap,
      kelengkapan,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Gagal mengambil statistik', error: error.message });
  }
};

// ---------- GET /api/akreditasi/items ----------
export const getItems = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    // Ambil data dari database menggunakan logic yang sama dengan getRekapBagian
    const items = await prisma.buktiPendukung.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    // Kelompokkan berdasarkan bagian
    const groups = new Map();

    for (const it of items) {
      let kode = 'UNK';
      let nama = 'Bagian Tidak Dikenal';
      let deskripsi = it.nama || 'Bukti pendukung';

      if (typeof it.nama === 'string' && it.nama.includes('-')) {
        const parts = it.nama.split('-').map(s => s.trim());
        if (parts.length >= 2) {
          kode = parts[0] || kode;
          nama = parts[1] || nama;
          deskripsi = parts.slice(2).join(' - ') || deskripsi;
        }
      }

      const key = `${kode}::${nama}`;
      const current = groups.get(key) || { 
        id: undefined, 
        kode_bagian: kode, 
        nama_bagian: nama, 
        deskripsi: '', 
        tanggal_update: undefined, 
        dokumen: [], 
        statusRaw: [] 
      };

      current.dokumen.push(it);
      current.statusRaw.push((it.status || '').toLowerCase());
      const ts = new Date(it.updatedAt || it.createdAt || Date.now()).toISOString();
      current.tanggal_update = !current.tanggal_update || ts > current.tanggal_update ? ts : current.tanggal_update;
      if (!current.deskripsi) current.deskripsi = deskripsi;

      groups.set(key, current);
    }

    // Tentukan status bagian
    const mapStatus = (statusList) => {
      if (!statusList || statusList.length === 0) return 'Kelengkapan';
      const allLower = statusList.map(s => String(s || '').toLowerCase());
      const allLengkap = allLower.every(s => s === 'lengkap' || s === 'complete' || s === 'siap export');
      return allLengkap ? 'Siap Export' : 'Belum Lengkap';
    };

    const result = [];
    let counter = 1;
    for (const [key, group] of groups) {
      result.push({
        id: counter++,
        kode_bagian: group.kode_bagian,
        nama_bagian: group.nama_bagian,
        deskripsi: group.deskripsi,
        tanggal_update: group.tanggal_update,
        status: mapStatus(group.statusRaw),
        dokumen: group.dokumen
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ message: 'Gagal mengambil data', error: error.message });
  }
};

// ---------- POST /api/akreditasi/export ----------
export const exportData = async (req, res) => {
  try {
    const { format, selectedIds, selectedTypes, selectedBagian } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userProdi = req.user?.prodi;
    
    if (!userId) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    console.log('🔵 EXPORT - User info:', { userId, userRole, userProdi });
    console.log('🔵 EXPORT - Request:', { format, selectedIds, selectedTypes, selectedBagian });

    // Ambil SEMUA data dari budaya_mutu (semua type)
    let whereClause = {};
    
    const normalizedRole = userRole ? userRole.trim().toLowerCase() : '';
    
    // Apply role-based filtering
    if (normalizedRole === 'tim-akreditasi' || normalizedRole === 'tim akreditasi') {
      // Tim Akreditasi dapat melihat semua data (untuk export gabungan)
      if (userProdi) {
        // Uncomment line dibawah jika ingin Tim Akreditasi hanya export prodi mereka
        // whereClause.prodi = userProdi;
      }
    } else if (normalizedRole !== 'p4m') {
      // Other roles filter by user_id and prodi
      whereClause.user_id = userId;
      if (userProdi) {
        whereClause.prodi = userProdi;
      }
    }
    // P4M can see all data (no additional filter)

    console.log('🔵 EXPORT - Where clause:', whereClause);

    // ✅ Mapping nama bagian ke source table dan subtabs
    const bagianMapping = {
      'budaya mutu': {
        sources: ['budaya_mutu'],
        types: ['tupoksi', 'pendanaan', 'penggunaan-dana', 'ewmp', 'ktk', 'spmi']
      },
      'relevansi pendidikan': {
        sources: ['relevansi_pendidikan'],
        subtabs: ['mahasiswa', 'keragaman-asal', 'kondisi-jumlah-mahasiswa', 'tabel-pembelajaran', 
                  'pemetaan-cpl-pl', 'peta-pemenuhan-cpl', 'rata-rata-masa-tunggu-lulusan', 
                  'kesesuaian-bidang', 'kepuasan-pengguna', 'fleksibilitas', 'rekognisi-apresiasi']
      },
      'relevansi penelitian': {
        sources: ['relevansi_penelitian'],
        subtabs: ['all'] // All subtabs
      },
      'relevansi pkm': {
        sources: ['relevansi_pkm'],
        subtabs: ['all']
      },
      'akuntabilitas': {
        sources: ['akuntabilitas'],
        subtabs: ['all']
      },
      'diferensiasi misi': {
        sources: ['diferensiasi_misi'],
        subtabs: ['all']
      }
    };

    // Determine which bagian are selected
    let selectedBagianNames = [];
    if (selectedBagian && Array.isArray(selectedBagian)) {
      selectedBagianNames = selectedBagian.map(b => String(b.nama_bagian || '').toLowerCase().trim());
    }
    
    console.log('🔵 EXPORT - Selected bagian:', selectedBagianNames);
    
    // Determine which sources to fetch
    const sourcesToFetch = new Set();
    const typesToInclude = new Set();
    const subtabsToInclude = {};
    
    if (selectedBagianNames.length === 0) {
      // No specific selection, fetch all
      console.log('⚠️ No specific bagian selected, fetching all data');
      sourcesToFetch.add('budaya_mutu');
      sourcesToFetch.add('relevansi_pendidikan');
      sourcesToFetch.add('relevansi_penelitian');
      sourcesToFetch.add('relevansi_pkm');
      sourcesToFetch.add('akuntabilitas');
      sourcesToFetch.add('diferensiasi_misi');
    } else {
      // Filter based on selected bagian
      selectedBagianNames.forEach(bagianName => {
        Object.keys(bagianMapping).forEach(key => {
          if (bagianName.includes(key) || key.includes(bagianName)) {
            const mapping = bagianMapping[key];
            mapping.sources.forEach(src => sourcesToFetch.add(src));
            if (mapping.types) {
              mapping.types.forEach(t => typesToInclude.add(t));
            }
            if (mapping.subtabs) {
              subtabsToInclude[mapping.sources[0]] = mapping.subtabs;
            }
          }
        });
      });
    }
    
    console.log('🔵 EXPORT - Sources to fetch:', Array.from(sourcesToFetch));
    console.log('🔵 EXPORT - Types to include:', Array.from(typesToInclude));
    console.log('🔵 EXPORT - Subtabs to include:', subtabsToInclude);

    // Fetch data dari tabel yang dipilih saja
    const allRecords = [];
    
    // 1. Budaya Mutu (dari budaya_mutu table)
    if (sourcesToFetch.has('budaya_mutu')) {
      try {
        let budayaMutuWhere = { ...whereClause };
        
        // Filter by types if specified
        if (typesToInclude.size > 0) {
          budayaMutuWhere.type = { in: Array.from(typesToInclude) };
        }
        
        const budayaMutuData = await prisma.budaya_mutu.findMany({
          where: budayaMutuWhere,
          orderBy: [{ type: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            type: true,
            prodi: true,
            data: true,
            created_at: true,
            updated_at: true,
          },
        });
        allRecords.push(...budayaMutuData.map(r => ({ ...r, source: 'budaya_mutu' })));
        console.log(`✅ Fetched ${budayaMutuData.length} records from budaya_mutu`);
      } catch (err) {
        console.error('❌ Error fetching budaya_mutu:', err);
      }
    }
    
    // 2. Relevansi Pendidikan (dari relevansi_pendidikan table)
    if (sourcesToFetch.has('relevansi_pendidikan')) {
      try {
        let relPendidikanWhere = whereClause.user_id ? { userId: whereClause.user_id } : {};
        
        // Filter by subtabs if specified
        if (subtabsToInclude['relevansi_pendidikan'] && !subtabsToInclude['relevansi_pendidikan'].includes('all')) {
          relPendidikanWhere.subtab = { in: subtabsToInclude['relevansi_pendidikan'] };
        }
        
        const relPendidikanData = await prisma.relevansi_pendidikan.findMany({
          where: relPendidikanWhere,
          orderBy: { id: 'asc' },
        });
        // Transform to match budaya_mutu structure
        relPendidikanData.forEach(item => {
          allRecords.push({
            id: item.id,
            type: item.subtab || 'relevansi-pendidikan',
            prodi: item.prodi || userProdi || 'N/A',
            data: item.data || {},
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            source: 'relevansi_pendidikan'
          });
        });
        console.log(`✅ Fetched ${relPendidikanData.length} records from relevansi_pendidikan`);
      } catch (err) {
        console.error('❌ Error fetching relevansi_pendidikan:', err);
      }
    }
    
    // 3. Relevansi Penelitian (dari relevansi_penelitian table)
    if (sourcesToFetch.has('relevansi_penelitian')) {
      try {
        const relPenelitianData = await prisma.relevansi_penelitian.findMany({
          where: whereClause.user_id ? { userId: whereClause.user_id } : {},
          orderBy: { id: 'asc' },
        });
        relPenelitianData.forEach(item => {
          allRecords.push({
            id: item.id,
            type: item.subtab || 'relevansi-penelitian',
            prodi: item.prodi || userProdi || 'N/A',
            data: item.data || {},
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            source: 'relevansi_penelitian'
          });
        });
        console.log(`✅ Fetched ${relPenelitianData.length} records from relevansi_penelitian`);
      } catch (err) {
        console.error('❌ Error fetching relevansi_penelitian:', err);
      }
    }
    
    // 4. Relevansi PKM (dari relevansi_pkm table)
    if (sourcesToFetch.has('relevansi_pkm')) {
      try {
        const relPkmData = await prisma.relevansi_pkm.findMany({
          where: whereClause.user_id ? { userId: whereClause.user_id } : {},
          orderBy: { id: 'asc' },
        });
        relPkmData.forEach(item => {
          allRecords.push({
            id: item.id,
            type: item.subtab || 'relevansi-pkm',
            prodi: item.prodi || userProdi || 'N/A',
            data: item.data || {},
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            source: 'relevansi_pkm'
          });
        });
        console.log(`✅ Fetched ${relPkmData.length} records from relevansi_pkm`);
      } catch (err) {
        console.error('❌ Error fetching relevansi_pkm:', err);
      }
    }
    
    // 5. Akuntabilitas (dari akuntabilitas table)
    if (sourcesToFetch.has('akuntabilitas')) {
      try {
        const akuntabilitasData = await prisma.akuntabilitas.findMany({
          where: whereClause.user_id ? { userId: whereClause.user_id } : {},
          orderBy: { id: 'asc' },
        });
        akuntabilitasData.forEach(item => {
          allRecords.push({
            id: item.id,
            type: 'akuntabilitas',
            prodi: item.prodi || userProdi || 'N/A',
            data: item.data || {},
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            source: 'akuntabilitas'
          });
        });
        console.log(`✅ Fetched ${akuntabilitasData.length} records from akuntabilitas`);
      } catch (err) {
        console.error('❌ Error fetching akuntabilitas:', err);
      }
    }
    
    // 6. Diferensiasi Misi (dari diferensiasi_misi table)
    if (sourcesToFetch.has('diferensiasi_misi')) {
      try {
        const diferensiasiData = await prisma.diferensiasi_misi.findMany({
          where: whereClause.user_id ? { userId: whereClause.user_id } : {},
          orderBy: { id: 'asc' },
        });
        diferensiasiData.forEach(item => {
          allRecords.push({
            id: item.id,
            type: 'diferensiasi-misi',
            prodi: item.prodi || userProdi || 'N/A',
            data: item.data || {},
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            source: 'diferensiasi_misi'
          });
        });
        console.log(`✅ Fetched ${diferensiasiData.length} records from diferensiasi_misi`);
      } catch (err) {
        console.error('❌ Error fetching diferensiasi_misi:', err);
      }
    }

    console.log(`🔵 EXPORT - Total records from all tables: ${allRecords.length}`);
    
    // Group by source untuk log detail
    const bySource = {};
    allRecords.forEach(r => {
      bySource[r.source] = (bySource[r.source] || 0) + 1;
    });
    console.log(`📊 Records by source:`, bySource);

    if (allRecords.length === 0) {
      return res.status(400).json({ message: "Tidak ada data LKPS untuk di-export. Pastikan data sudah disimpan di database." });
    }

    // Group records by type
    const recordsByType = {};
    allRecords.forEach(record => {
      if (!recordsByType[record.type]) {
        recordsByType[record.type] = [];
      }
      recordsByType[record.type].push(record);
    });

    console.log(`🔵 EXPORT - Types found:`, Object.keys(recordsByType));

    console.log(`🔵 EXPORT - Types found:`, Object.keys(recordsByType));

    const fileName = `lkps-export-${Date.now()}`;
    const exportDir = path.join(__dirname, "../exports");
    
    // Buat folder exports kalau belum ada
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    if (format.toLowerCase() === 'excel' || format.toLowerCase() === 'xlsx') {
      // Export ke Excel dengan sheet berbeda untuk setiap type
      const workbook = XLSX.utils.book_new();

      // Helper function to convert camelCase/snake_case to Title Case
      const toTitleCase = (str) => {
        return str
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
          .trim();
      };

      // Helper to check if a value is truly empty
      const isEmpty = (val) => {
        if (val === null || val === undefined || val === '') return true;
        if (typeof val === 'string' && val.trim() === '') return true;
        if (Array.isArray(val) && val.length === 0) return true;
        if (typeof val === 'object' && Object.keys(val).length === 0) return true;
        return false;
      };

      // Helper to recursively flatten nested objects (untuk SPMI dan data kompleks)
      const flattenNestedObject = (obj, prefix = '') => {
        const flattened = {};
        
        for (const key in obj) {
          const value = obj[key];
          const newKey = prefix ? `${prefix} > ${toTitleCase(key)}` : toTitleCase(key);
          
          if (isEmpty(value)) {
            flattened[newKey] = '-';
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            // Recursively flatten nested objects
            const nested = flattenNestedObject(value, newKey);
            Object.assign(flattened, nested);
          } else if (Array.isArray(value)) {
            // Handle arrays
            if (value.every(item => typeof item !== 'object')) {
              // Array of primitives
              flattened[newKey] = value.join(', ');
            } else {
              // Array of objects - convert to readable string
              flattened[newKey] = value.map((item, idx) => {
                if (typeof item === 'object') {
                  return `[${idx + 1}] ${Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
                }
                return item;
              }).join(' | ');
            }
          } else {
            flattened[newKey] = String(value);
          }
        }
        
        return flattened;
      };

      // Process each type - dengan handling khusus untuk SPMI
      Object.keys(recordsByType).forEach(type => {
        const records = recordsByType[type];
        const allRows = [];

        records.forEach((record) => {
          const jsonData = record.data;
          
          if (!jsonData) return; // Skip if no data
          
          // Common fields for all rows
          const commonFields = {
            'Prodi': record.prodi || '-',
            'Tanggal Input': record.created_at ? new Date(record.created_at).toLocaleDateString('id-ID') : '-',
            'Tanggal Update': record.updated_at ? new Date(record.updated_at).toLocaleDateString('id-ID') : '-',
          };

          // SPECIAL HANDLING FOR SPMI - nested array structure [{id, data: {...}}]
          if (type === 'spmi' && Array.isArray(jsonData)) {
            jsonData.forEach((item) => {
              if (!item || typeof item !== 'object') return;
              
              // SPMI has nested structure: {id, data: {...}}
              const actualData = item.data || item;
              
              const hasData = Object.values(actualData).some(val => !isEmpty(val));
              if (!hasData) return;
              
              const row = { ...commonFields };
              const flattened = flattenNestedObject(actualData);
              Object.assign(row, flattened);
              allRows.push(row);
            });
            return; // Skip normal processing
          }

          // Handle single object (data saved as single object instead of array)
          if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
            const hasData = Object.values(jsonData).some(val => !isEmpty(val));
            if (!hasData) return;
            
            const row = { ...commonFields };
            
            // Add all fields directly
            Object.keys(jsonData).forEach(key => {
              const value = jsonData[key];
              const columnName = toTitleCase(key);
              
              if (isEmpty(value)) {
                row[columnName] = '-';
              } else if (Array.isArray(value)) {
                row[columnName] = value.join(', ');
              } else if (typeof value === 'object') {
                row[columnName] = JSON.stringify(value);
              } else {
                row[columnName] = String(value);
              }
            });
            
            allRows.push(row);
            return; // Done processing this record
          }

          // Handle array data (like tupoksi - should be array of flat objects)
          if (Array.isArray(jsonData)) {
            jsonData.forEach((item) => {
              // Skip empty items
              if (!item || typeof item !== 'object') return;
              
              // Check if item has at least one non-empty value
              const hasData = Object.values(item).some(val => !isEmpty(val));
              if (!hasData) return;
              
              // Create row with common fields + data fields
              const row = { ...commonFields };
              
              // Flatten the item recursively to handle nested objects
              const flattenItem = (obj, prefix = '') => {
                Object.keys(obj).forEach(key => {
                  const value = obj[key];
                  const columnName = prefix ? `${prefix} ${toTitleCase(key)}` : toTitleCase(key);
                  
                  // Handle different value types
                  if (isEmpty(value)) {
                    row[columnName] = '-';
                  } else if (Array.isArray(value)) {
                    // Check if array contains objects
                    if (value.length > 0 && typeof value[0] === 'object') {
                      // Array of objects - convert to readable format
                      row[columnName] = value.map((v, idx) => {
                        const entries = Object.entries(v).map(([k, val]) => `${toTitleCase(k)}: ${val || '-'}`).join(', ');
                        return `[${idx + 1}] ${entries}`;
                      }).join(' | ');
                    } else {
                      // Array of primitives
                      row[columnName] = value.join(', ');
                    }
                  } else if (typeof value === 'object' && value !== null) {
                    // Nested object - flatten recursively
                    flattenItem(value, columnName);
                  } else {
                    row[columnName] = String(value);
                  }
                });
              };
              
              flattenItem(item);
              allRows.push(row);
            });
          }
        });

        // Only create sheet if there's data
        if (allRows.length > 0) {
          // Add row numbers
          allRows.forEach((row, idx) => {
            row['No'] = idx + 1;
          });
          
          // Reorder columns: No first, then common fields, then data fields
          const orderedRows = allRows.map(row => {
            const { No, Prodi, 'Tanggal Input': tanggalInput, 'Tanggal Update': tanggalUpdate, ...rest } = row;
            return { No, Prodi, 'Tanggal Input': tanggalInput, 'Tanggal Update': tanggalUpdate, ...rest };
          });

          const worksheet = XLSX.utils.json_to_sheet(orderedRows);
          
          // Set column widths dynamically
          if (orderedRows.length > 0) {
            const cols = Object.keys(orderedRows[0]).map(key => {
              const maxLength = Math.max(
                key.length,
                ...orderedRows.map(row => String(row[key] || '').length)
              );
              return { wch: Math.min(Math.max(maxLength, 10), 50) };
            });
            worksheet['!cols'] = cols;
          }

          // Create sheet name (capitalize and limit to 31 chars for Excel)
          const sheetNameMap = {
            'tupoksi': 'Tupoksi',
            'pendanaan': 'Pendanaan',
            'penggunaan-dana': 'Penggunaan Dana',
            'ewmp': 'EWMP',
            'ktk': 'KTK',
            'spmi': 'SPMI',
            'mahasiswa': 'Mahasiswa',
            'keragaman-asal': 'Keragaman Asal',
            'kondisi-jumlah-mahasiswa': 'Kondisi Mahasiswa',
            'tabel-pembelajaran': 'Pembelajaran',
            'pemetaan-cpl-pl': 'Pemetaan CPL-PL',
            'peta-pemenuhan-cpl': 'Pemenuhan CPL',
            'rata-rata-masa-tunggu-lulusan': 'Masa Tunggu Lulusan',
            'kesesuaian-bidang': 'Kesesuaian Bidang',
            'kepuasan-pengguna': 'Kepuasan Pengguna',
            'fleksibilitas': 'Fleksibilitas',
            'rekognisi-apresiasi': 'Rekognisi',
            'relevansi-pendidikan': 'Relevansi Pendidikan',
            'relevansi-penelitian': 'Relevansi Penelitian',
            'relevansi-pkm': 'Relevansi PKM',
            'akuntabilitas': 'Akuntabilitas',
            'diferensiasi-misi': 'Diferensiasi Misi'
          };
          
          const sheetName = sheetNameMap[type.toLowerCase()] || toTitleCase(type);
          const truncatedName = sheetName.substring(0, 31);
          
          console.log(`📊 Creating sheet: "${truncatedName}" with ${allRows.length} rows`);
          XLSX.utils.book_append_sheet(workbook, worksheet, truncatedName);
        }
      });

      const filePath = path.join(exportDir, `${fileName}.xlsx`);
      XLSX.writeFile(workbook, filePath);

      res.download(filePath, `${fileName}.xlsx`, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Gagal mengirim file" });
          }
        }
        // Hapus file setelah dikirim
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Error deleting file:", e);
        }
      });
    } else if (format.toLowerCase() === 'pdf') {
      // Streaming PDF langsung ke response menggunakan pdfkit (tanpa menulis ke disk)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);

      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      doc.pipe(res);

      // Title
      doc.fontSize(16).fillColor('#000').text('DATA LKPS - LAPORAN AKREDITASI', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#666').text(`Politeknik Negeri Batam`, { align: 'center' });
      doc.fontSize(9).fillColor('#666').text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
      doc.moveDown(1);

      const drawRecord = (type, record, index) => {
        const startY = doc.y;
        doc.fontSize(12).fillColor('#000').text(`${type.toUpperCase()}`, { continued: false });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#333').text(`[${index + 1}] Prodi: ${record.prodi || 'N/A'}`);
        doc.moveDown(0.2);

        // Format JSON data secara ringkas agar muat di halaman
        const dataStr = JSON.stringify(record.data, null, 2);
        const paragraphs = dataStr.split('\n');
        paragraphs.forEach(p => {
          doc.fontSize(9).fillColor('#111').text(p, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
        });

        doc.moveDown(0.8);
        // Garis pemisah
        doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).dash(2, { space: 2 }).stroke().undash();
        doc.moveDown(0.8);
      };

      // Iterate types and records
      const types = Object.keys(recordsByType);
      types.forEach((type, tIdx) => {
        const records = recordsByType[type];
        // Header section per type
        doc.fontSize(12).fillColor('#005f99').text(`${type.toUpperCase()}`, { underline: true });
        doc.moveDown(0.5);

        records.forEach((record, idx) => {
          // Page break manual jika mendekati bawah halaman
          if (doc.y > doc.page.height - doc.page.margins.bottom - 120) {
            doc.addPage();
          }
          drawRecord(type, record, idx);
        });

        if (tIdx < types.length - 1) {
          doc.addPage();
        }
      });

      doc.end();
    } else if (format.toLowerCase() === 'docs' || format.toLowerCase() === 'docx') {
      // Export ke Word Document format (.doc) yang langsung bisa dibuka di Microsoft Word
      const htmlContent = generateHTMLDocument(recordsByType, userProdi);
      
      const filePath = path.join(exportDir, `${fileName}.doc`);
      fs.writeFileSync(filePath, htmlContent, 'utf8');

      // Set MIME type untuk Microsoft Word
      res.setHeader('Content-Type', 'application/msword');
      res.download(filePath, `${fileName}.doc`, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Gagal mengirim file" });
          }
        }
        // Hapus file setelah dikirim
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Error deleting file:", e);
        }
      });
    } else {
      res.status(400).json({ message: "Format tidak didukung. Gunakan Excel, PDF, atau Docs." });
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Gagal export data", error: error.message });
  }
};

// ---------- Upload Config ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `upload-${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ---------- POST /api/akreditasi/upload ----------
export const uploadMiddleware = upload.single("document");

export const uploadDocument = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diupload" });
  }
  res.json({
    message: "File berhasil diupload",
    file: req.file.filename,
  });
};

// ---------- GET /api/akreditasi/bagian ----------
export const getBagian = (req, res) => {
  res.json([
    {
      id: 1,
      kode_bagian: "A1",
      nama_bagian: "Visi & Misi",
      deskripsi: "Menjelaskan visi dan misi institusi",
      tanggal_update: "2025-01-10",
      status: "Siap Export",
    },
    {
      id: 2,
      kode_bagian: "B1",
      nama_bagian: "Kurikulum",
      deskripsi: "Struktur kurikulum dan capaian pembelajaran",
      tanggal_update: "2025-02-05",
      status: "Belum Lengkap",
    },
  ]);
};

// ---------- GET /api/akreditasi/templates ----------
export const getTemplates = (req, res) => {
  res.json([
    { id: 1, nama_template: "Template BAN-PT", jenis_template: "PDF" },
    { id: 2, nama_template: "Template Internal", jenis_template: "Excel" },
  ]);
};

// ---------- POST /api/akreditasi/tupoksi/save ----------
export const saveTupoksi = async (req, res) => {
  try {
    const { prodi, data } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userProdi = req.user?.prodi;

    if (!userId) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    // Validasi input
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: 'Data tupoksi harus berupa array' });
    }

    // Tentukan prodi yang akan disimpan
    let targetProdi = prodi;
    const normalizedRole = userRole ? userRole.trim().toLowerCase() : '';

    // Role validation
    if (normalizedRole === 'tim-akreditasi' || normalizedRole === 'tim akreditasi') {
      // Tim Akreditasi hanya bisa save untuk prodi mereka sendiri
      if (!userProdi) {
        return res.status(403).json({ message: "Prodi pengguna tidak ditemukan" });
      }
      targetProdi = userProdi; // Override dengan prodi user
    } else if (normalizedRole !== 'p4m') {
      // Other roles (non P4M) also use their own prodi
      if (!userProdi) {
        return res.status(403).json({ message: "Prodi pengguna tidak ditemukan" });
      }
      targetProdi = userProdi;
    }

    if (!targetProdi) {
      return res.status(400).json({ message: 'Prodi tidak boleh kosong' });
    }

    // Cek apakah sudah ada data tupoksi untuk prodi ini
    const existingRecord = await prisma.budaya_mutu.findFirst({
      where: {
        user_id: userId,
        prodi: targetProdi,
        type: 'tupoksi',
      },
    });

    let result;

    if (existingRecord) {
      // UPDATE existing record
      result = await prisma.budaya_mutu.update({
        where: { id: existingRecord.id },
        data: {
          data: data, // JSON field
          updated_at: new Date(),
        },
      });
    } else {
      // CREATE new record
      result = await prisma.budaya_mutu.create({
        data: {
          user_id: userId,
          prodi: targetProdi,
          type: 'tupoksi',
          data: data, // JSON field
        },
      });
    }

    res.json({
      success: true,
      message: existingRecord ? 'Data tupoksi berhasil diperbarui' : 'Data tupoksi berhasil disimpan',
      data: result,
    });
  } catch (error) {
    console.error("Save tupoksi error:", error);
    res.status(500).json({ 
      success: false,
      message: "Gagal menyimpan data tupoksi", 
      error: error.message 
    });
  }
};

// ---------- GET /api/akreditasi/tupoksi ----------
export const getTupoksi = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userProdi = req.user?.prodi;
    const { prodi } = req.query; // Optional prodi filter for P4M

    if (!userId) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    let whereClause = { type: 'tupoksi' };
    const normalizedRole = userRole ? userRole.trim().toLowerCase() : '';

    // Apply role-based filtering
    if (normalizedRole === 'tim-akreditasi' || normalizedRole === 'tim akreditasi') {
      if (!userProdi) {
        return res.status(403).json({ message: "Prodi pengguna tidak ditemukan" });
      }
      whereClause.prodi = userProdi;
      whereClause.user_id = userId;
    } else if (normalizedRole === 'p4m') {
      // P4M can view all, but can filter by prodi if provided
      if (prodi) {
        whereClause.prodi = prodi;
      }
    } else {
      // Other roles filter by user_id and prodi
      whereClause.user_id = userId;
      if (userProdi) {
        whereClause.prodi = userProdi;
      }
    }

    const tupoksiRecords = await prisma.budaya_mutu.findMany({
      where: whereClause,
      orderBy: { updated_at: 'desc' },
      select: {
        id: true,
        prodi: true,
        data: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      data: tupoksiRecords,
    });
  } catch (error) {
    console.error("Get tupoksi error:", error);
    res.status(500).json({ 
      success: false,
      message: "Gagal mengambil data tupoksi", 
      error: error.message 
    });
  }
};

// ---------- DELETE /api/akreditasi/tupoksi/:id ----------
export const deleteTupoksi = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    // Cek apakah record exists dan milik user ini
    const record = await prisma.budaya_mutu.findUnique({
      where: { id: parseInt(id) },
    });

    if (!record) {
      return res.status(404).json({ message: 'Data tupoksi tidak ditemukan' });
    }

    // Only allow deletion if user owns the record or is P4M
    const normalizedRole = userRole ? userRole.trim().toLowerCase() : '';
    if (record.user_id !== userId && normalizedRole !== 'p4m') {
      return res.status(403).json({ message: 'Tidak memiliki akses untuk menghapus data ini' });
    }

    await prisma.budaya_mutu.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Data tupoksi berhasil dihapus',
    });
  } catch (error) {
    console.error("Delete tupoksi error:", error);
    res.status(500).json({ 
      success: false,
      message: "Gagal menghapus data tupoksi", 
      error: error.message 
    });
  }
};