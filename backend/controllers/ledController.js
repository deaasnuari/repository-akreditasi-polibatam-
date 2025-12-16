
import prisma from '../prismaClient.js';

/**
 * GET semua data LED untuk user tertentu
 */
export const getAllLEDData = async (req, res) => {
  try {
    const { user_id } = req.params;
    const parsedUserId = Number(user_id);
    if (Number.isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'Invalid user_id' });
    }

    const rows = await prisma.led.findMany({
      where: { user_id: parsedUserId },
      orderBy: { updated_at: 'desc' },
    });

    // Transform ke format FE: { subtab: data }
    const result = {};
    rows.forEach(row => {
      result[row.subtab] = row.data;
    });

    res.json(result);
  } catch (err) {
    console.error('getAllLEDData error:', err);
    res.status(500).json({ message: 'Server error' });
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

    // Upsert: update jika ada, create jika tidak
    const upserted = await prisma.led.upsert({
      where: {
        user_id_subtab: {
          user_id: parsedUserId,
          subtab: subtab,
        },
      },
      update: { data },
      create: {
        user_id: parsedUserId,
        subtab,
        data,
        role,
      },
    });

    res.json({ data: upserted });
  } catch (err) {
    console.error('saveLEDTab error:', err);
    res.status(500).json({ message: 'Server error' });
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

    // Upsert the LED subtab data
    const existing = await prisma.led.findFirst({ where: { user_id: user_id, subtab: type }, select: { id: true } });
    let savedLED;
    if (existing) {
      savedLED = await prisma.led.update({ where: { id: existing.id }, data: { data: currentData, updated_at: new Date() } });
    } else {
      savedLED = await prisma.led.create({ data: { user_id, subtab: type, data: currentData, role: req.user.role || '' } });
    }

    // Create or update BuktiPendukung reference
    const existingBukti = await prisma.buktiPendukung.findFirst({ where: { userId: user_id, path: path } });
    let buktiPendukungEntry;
    if (existingBukti) {
      buktiPendukungEntry = await prisma.buktiPendukung.update({ where: { id: existingBukti.id }, data: { status: status } });
    } else {
      buktiPendukungEntry = await prisma.buktiPendukung.create({ data: { nama: nama || `Draft LED - ${type}`, path: path || `/dashboard/tim-akreditasi/led?tab=${type}`, status: status || 'Draft', userId: user_id } });
    }

    res.json({ success: true, message: 'Draft LED berhasil disimpan dan referensi Bukti Pendukung diperbarui', savedLED, buktiPendukungEntry, redirect: '/dashboard/tim-akreditasi/bukti-pendukung' });
  } catch (err) {
    console.error('SAVE DRAFT LED ERROR:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan draft LED', error: err.message });
  }
};
