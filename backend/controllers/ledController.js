
import prisma from '../prismaClient.js';

/**
 * GET semua data LED untuk user tertentu
 * Response format: { "budaya-mutu": { ...data }, "relevansi-pendidikan": { ...data }, ... }
 */
export const getAllLEDData = async (req, res) => {
  try {
    const { user_id } = req.params;
    const parsedUserId = Number(user_id);
    if (Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user_id' });
    }

    console.log(`📥 [LED] Fetching all LED data for user ${parsedUserId}`);

    const rows = await prisma.led.findMany({
      where: { user_id: parsedUserId },
      orderBy: { updated_at: 'desc' },
    });

    console.log(`✅ [LED] Found ${rows.length} LED records for user ${parsedUserId}`);

    // Transform ke format FE: { subtab: data }
    const result = {};
    rows.forEach(row => {
      const dataKeys = Object.keys(row.data || {});
      console.log(`   → subtab: "${row.subtab}", data keys: [${dataKeys.join(', ')}], data size: ${JSON.stringify(row.data).length} chars`);
      result[row.subtab] = row.data;
    });

    console.log(`📤 [LED] Returning data with subtabs: [${Object.keys(result).join(', ')}]`);

    res.json(result);
  } catch (err) {
    console.error('❌ [LED] getAllLEDData error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET export gabungan semua LED berdasarkan user_id (opsional filter role)
 * Query: userId (wajib), role (opsional)
 * Response: { userId, role?, count, items: [ { title, subtab, role, sections: [...] } ] }
 */
export const exportCombinedLED = async (req, res) => {
  try {
    const { userId, role } = req.query;
    const parsedUserId = Number(userId);
    if (!userId || Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'userId query param is required and must be a number' });
    }

    const rows = await prisma.led.findMany({
      where: { user_id: parsedUserId, ...(role ? { role: String(role) } : {}) },
      orderBy: { subtab: 'asc' },
    });

    const normalizeRow = (row) => {
      const data = row.data || {};
      const title = (data && data.title) ? String(data.title) : `LED - ${row.subtab}`;

      // Jika data.sections sudah ada dalam format standar
      let sections = Array.isArray(data.sections) ? data.sections : undefined;

      // Fallback: bangun sections dari key top-level
      if (!sections) {
        sections = [];
        const excludedKeys = new Set(['title', 'meta', 'created_at', 'updated_at']);
        Object.keys(data || {}).forEach((key) => {
          if (excludedKeys.has(key)) return;
          const value = data[key];
          const heading = key;

          // Array of objects homogen -> table
          if (Array.isArray(value) && value.length > 0 && value.every((v) => v && typeof v === 'object' && !Array.isArray(v))) {
            const head = [Object.keys(value[0])];
            const body = value.map((rowObj) => head[0].map((k) => {
              const cell = rowObj[k];
              if (cell === null || cell === undefined) return '';
              if (typeof cell === 'object') return JSON.stringify(cell);
              return String(cell);
            }));
            sections.push({ heading, table: { head, body } });
          } else if (value && typeof value === 'object') {
            // Object nested -> stringify ringkas
            sections.push({ heading, text: JSON.stringify(value) });
          } else if (value !== undefined && value !== null) {
            // Primitive -> text
            sections.push({ heading, text: String(value) });
          }
        });

        if (sections.length === 0) {
          sections.push({ heading: 'Konten', text: JSON.stringify(data) });
        }
      }

      return { title, subtab: row.subtab, role: row.role, sections };
    };

    const items = rows.map(normalizeRow);

    return res.json({ userId: parsedUserId, role: role || undefined, count: items.length, items });
  } catch (err) {
    console.error('exportCombinedLED error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST save/update LED tab untuk user tertentu
 */
export const saveLEDTab = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { subtab, data, role } = req.body;

    const parsedUserId = Number(user_id);
    if (Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user_id' });
    }

    if (!subtab || !data) {
      return res.status(400).json({ message: 'subtab and data are required' });
    }

    console.log(`💾 [LED] Saving LED for user ${parsedUserId}, subtab: "${subtab}"`);
    console.log(`   → Data keys: [${Object.keys(data || {}).join(', ')}]`);
    console.log(`   → Data size: ${JSON.stringify(data).length} chars`);

    // Upsert: update jika ada, create jika tidak
    const upserted = await prisma.led.upsert({
      where: {
        user_id_subtab: {
          user_id: parsedUserId,
          subtab: subtab,
        },
      },
      update: { 
        data,
        updated_at: new Date()
      },
      create: {
        user_id: parsedUserId,
        subtab,
        data,
        role: role || 'TIM_AKREDITASI',
      },
    });

    console.log(`✅ [LED] Successfully saved LED for subtab "${subtab}" (id: ${upserted.id})`);
    res.json({ success: true, message: 'Data LED berhasil disimpan', data: upserted });
  } catch (err) {
    console.error('❌ [LED] saveLEDTab error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * DELETE hapus LED tab untuk user tertentu
 */
export const deleteLEDTab = async (req, res) => {
  try {
    const { user_id, subtab } = req.params;
    const parsedUserId = Number(user_id);
    if (Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user_id' });
    }

    if (!subtab) {
      return res.status(400).json({ message: 'subtab is required' });
    }

    await prisma.led.deleteMany({
      where: {
        user_id: parsedUserId,
        subtab: subtab,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('deleteLEDTab error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * SAVE DRAFT - Save LED draft and create/update BuktiPendukung reference
 * Body: { nama, path, status, type, currentData }
 */
export const saveDraft = async (req, res) => {
  try {
    const { nama, path, status, type, currentData } = req.body;
    const user_id = req.user && req.user.id;

    if (!user_id) return res.status(401).json({ success: false, message: 'User tidak terautentikasi' });
    if (!type || !currentData) return res.status(400).json({ success: false, message: 'type dan currentData wajib diisi' });

    console.log(`💾 [LED-DRAFT] Saving draft for user ${user_id}, type: "${type}"`);

    // Upsert the LED subtab data
    const existing = await prisma.led.findFirst({ where: { user_id: user_id, subtab: type }, select: { id: true } });
    let savedLED;
    if (existing) {
      savedLED = await prisma.led.update({ where: { id: existing.id }, data: { data: currentData, updated_at: new Date() } });
      console.log(`   → Updated existing LED (id: ${existing.id})`);
    } else {
      savedLED = await prisma.led.create({ data: { user_id, subtab: type, data: currentData, role: req.user.role || '' } });
      console.log(`   → Created new LED (id: ${savedLED.id})`);
    }

    // Create or update BuktiPendukung reference
    const existingBukti = await prisma.buktiPendukung.findFirst({ where: { userId: user_id, path: path } });
    let buktiPendukungEntry;
    if (existingBukti) {
      buktiPendukungEntry = await prisma.buktiPendukung.update({ where: { id: existingBukti.id }, data: { status: status } });
      console.log(`   → Updated BuktiPendukung reference (id: ${existingBukti.id})`);
    } else {
      buktiPendukungEntry = await prisma.buktiPendukung.create({ data: { nama: nama || `Draft LED - ${type}`, path: path || `/dashboard/tim-akreditasi/led?tab=${type}`, status: status || 'Draft', userId: user_id } });
      console.log(`   → Created BuktiPendukung reference (id: ${buktiPendukungEntry.id})`);
    }

    console.log(`✅ [LED-DRAFT] Successfully saved draft for ${type}`);
    res.json({ success: true, message: 'Draft LED berhasil disimpan dan referensi Bukti Pendukung diperbarui', savedLED, buktiPendukungEntry, redirect: '/dashboard/tim-akreditasi/bukti-pendukung' });
  } catch (err) {
    console.error('❌ [LED-DRAFT] Error:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan draft LED', error: err.message });
  }
};

/**
 * GET LED data untuk specific subtab (untuk validasi sebelum export)
 * GET /api/led/:user_id/:subtab
 */
export const getLEDBySubtab = async (req, res) => {
  try {
    const { user_id, subtab } = req.params;
    const parsedUserId = Number(user_id);
    
    if (Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user_id' });
    }

    if (!subtab) {
      return res.status(400).json({ message: 'Subtab is required' });
    }

    console.log(`📥 [LED] Fetching LED data for user ${parsedUserId}, subtab: "${subtab}"`);

    const ledData = await prisma.led.findFirst({
      where: { 
        user_id: parsedUserId,
        subtab: subtab
      },
    });

    if (!ledData) {
      console.log(`⚠️ [LED] No data found for subtab "${subtab}"`);
      return res.status(404).json({ 
        message: 'Data LED tidak ditemukan', 
        subtab: subtab,
        hasData: false 
      });
    }

    console.log(`✅ [LED] Found LED data for subtab "${subtab}" (id: ${ledData.id})`);
    console.log(`   → Data keys: [${Object.keys(ledData.data || {}).join(', ')}]`);

    res.json({ 
      success: true,
      hasData: true,
      subtab: ledData.subtab,
      data: ledData.data,
      updated_at: ledData.updated_at
    });
  } catch (err) {
    console.error('❌ [LED] getLEDBySubtab error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
