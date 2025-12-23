import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';

const prisma = new PrismaClient();

// GET /api/matriks-penilaian/kriteria
export const getKriteria = async (req, res) => {
  try {
    const criteria = await prisma.criteria_items.findMany({
      orderBy: [
        { jenis: 'asc' },
        { no_urut: 'asc' }
      ]
    });

    // Transform to match frontend expectations
    const transformed = criteria.map(item => ({
      id: item.id,
      jenis: item.jenis,
      no_urut: item.no_urut,
      no_butir: item.no_butir,
      kriteria: item.elemen_penilaian,
      bobot: item.bobot_raw,
      skor_maksimal: 4,
      deskriptor: item.deskriptor,
      descriptor_4: item.descriptor_4,
      descriptor_3: item.descriptor_3,
      descriptor_2: item.descriptor_2,
      descriptor_1: item.descriptor_1,
    }));

    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error fetching criteria:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch criteria' });
  }
};

// GET /api/matriks-penilaian/scores/:prodiName
export const getScoresByProdi = async (req, res) => {
  try {
    const { prodiName } = req.params; // prodiName is the string representation of the program study
    const userId = req.user?.id;

    // Validate that user belongs to the requested prodi or is an admin/TU
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, prodi: true } // Select prodi as well
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`Debug getScoresByProdi: User Role=${user.role}, User Prodi=${user.prodi}, Requested Prodi=${prodiName}`); // DEBUG LOG

    // Allow access if user is admin/TU or if the user's prodi matches the requested prodiName
    if (user.role !== 'TU' && user.prodi !== prodiName) {
      return res.status(403).json({ success: false, message: 'Access denied. User does not belong to the requested prodi.' });
    }

    const scores = await prisma.criteria_scores.findMany({
      where: {
        prodi: prodiName, // Use the prodi string from params
      },
      include: {
        criterion: true
      },
            orderBy: [
              {
                criterion: {
                  jenis: 'asc'
                }
              },
              {
                criterion: {
                  no_urut: 'asc'
                }
              }
            ]
    });

    res.json({ success: true, data: scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch scores' });
  }
};

// POST /api/matriks-penilaian/scores
export const saveScore = async (req, res) => {
  try {
    const { prodiName, criteria_item_id, skor_prodi } = req.body; // Expect prodiName as string
    const userId = req.user?.id;

    // Validate input
    if (!prodiName || !criteria_item_id || skor_prodi === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (skor_prodi < 1 || skor_prodi > 4) {
      return res.status(400).json({ success: false, message: 'Skor must be between 1-4' });
    }

    // Validate user belongs to the prodi or is an admin
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, prodi: true } // Select prodi as well
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Allow access if user is admin/TU or if the user's prodi matches the requested prodiName
    if (user.role !== 'TU' && user.prodi !== prodiName) {
      return res.status(403).json({ success: false, message: 'Access denied. User does not belong to the requested prodi.' });
    }

    // Check if score exists using the new unique constraint
    const existingScore = await prisma.criteria_scores.findUnique({
      where: {
        unique_score_per_prodi_item: { // New unique constraint name
          prodi: prodiName,
          criteria_item_id: criteria_item_id,
        },
      },
    });

    // Get criteria item to calculate weighted score
    const criteriaItem = await prisma.criteria_items.findUnique({
      where: { id: criteria_item_id }
    });

    if (!criteriaItem) {
      return res.status(404).json({ success: false, message: 'Criteria item not found' });
    }

    const skor_terbobot = parseFloat((skor_prodi * (criteriaItem.bobot_raw / 400)).toFixed(3));

    let savedScore;
    if (existingScore) {
      // If it exists, update it
      savedScore = await prisma.criteria_scores.update({
        where: {
          id: existingScore.id,
        },
        data: {
          user_id: userId, // Update user_id to track last modifier
          skor_prodi: skor_prodi,
          skor_terbobot: skor_terbobot,
        },
      });

    } else {
      // If it doesn't exist, create it
      savedScore = await prisma.criteria_scores.create({
        data: {
          user_id: userId, // Current user is the one saving
          prodi: prodiName, // Include prodi
          criteria_item_id: criteria_item_id,
          skor_prodi: skor_prodi,
          skor_terbobot: skor_terbobot,
        },
      });
    }
    res.json({ success: true, data: savedScore });
  } catch (error) {
    console.error('Error saving score:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to save score' });
  }
};

// GET /api/matriks-penilaian/summary/:prodiName
export const getSummaryByProdi = async (req, res) => {
  try {
    const { prodiName } = req.params;
    const userId = req.user?.id;

    // Validate access
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, prodi: true } // Select prodi as well
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Allow access if user is admin/TU or if the user's prodi matches the requested prodiName
    if (user.role !== 'TU' && user.prodi !== prodiName) {
      return res.status(403).json({ success: false, message: 'Access denied. User does not belong to the requested prodi.' });
    }

    // Get all scores for the prodi
    const scores = await prisma.criteria_scores.findMany({
      where: { prodi: prodiName }, // Filter by prodiName
      select: { skor_terbobot: true }
    });

    // Calculate total score
    const totalScore = scores.reduce((sum, score) => sum + parseFloat(score.skor_terbobot), 0);

    // Determine accreditation grade
    let grade = 'Tidak Terakreditasi';
    if (totalScore >= 3.51) grade = 'A';
    else if (totalScore >= 3.01) grade = 'B';
    else if (totalScore >= 2.01) grade = 'C';

    res.json({
      success: true,
      data: {
        total_score: parseFloat(totalScore.toFixed(2)),
        grade: grade,
        criteria_count: scores.length
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
};

// GET /api/matriks-penilaian/prodi
export const getProdiList = async (req, res) => {
  try {
    const prodi = await prisma.prodi.findMany({
      where: { status: 'aktif' },
      select: {
        id: true,
        kode_prodi: true,
        nama_prodi: true,
        fakultas: true
      },
      orderBy: { kode_prodi: 'asc' }
    });

    res.json({ success: true, data: prodi });
  } catch (error) {
    console.error('Error fetching prodi list:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prodi list' });
  }
};

export const exportToExcel = async (req, res) => {
  try {
    const prodiName = req.user?.prodi;
    if (!prodiName) {
      // If user has no prodi, maybe they are admin. Check for query param.
      // For now, let's stick to the user's prodi.
      return res.status(400).json({ success: false, message: 'Prodi not found for user.' });
    }

    const criteria = await prisma.criteria_items.findMany({
      orderBy: [
        { jenis: 'asc' },
        { no_urut: 'asc' }
      ]
    });
    
    const scores = await prisma.criteria_scores.findMany({
      where: {
        prodi: prodiName,
      },
    });

    const data = criteria.map(c => {
      const score = scores.find(s => s.criteria_item_id === c.id);
      return {
        'Jenis': c.jenis,
        'No. Butir': c.no_butir,
        'Elemen Penilaian': c.elemen_penilaian,
        'Bobot': c.bobot_raw,
        'Skor Prodi': score ? score.skor_prodi : 'N/A',
        'Skor Terbobot': score ? score.skor_terbobot : 'N/A'
      };
    });

    const totalSkor = scores.reduce((sum, score) => sum + parseFloat(score.skor_terbobot), 0);
    data.push({}); // empty row
    data.push({ 'Elemen Penilaian': 'Total Skor', 'Skor Terbobot': totalSkor.toFixed(2) });


    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Hasil Penilaian');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="hasil-penilaian-${prodiName}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ success: false, message: 'Failed to export to Excel' });
  }
};
