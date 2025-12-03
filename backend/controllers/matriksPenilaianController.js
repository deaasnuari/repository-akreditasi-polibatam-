import { PrismaClient } from '@prisma/client';

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

// GET /api/matriks-penilaian/scores/:prodiId
export const getScoresByProdi = async (req, res) => {
  try {
    const { prodiId } = req.params;
    const userId = req.user?.id; // From auth middleware

    // Validate that user belongs to the requested prodi
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    // Allow access if user is admin/TU or belongs to the prodi
    if (user.role !== 'TU' && userId !== parseInt(prodiId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const scores = await prisma.criteria_scores.findMany({
      where: { user_id: parseInt(prodiId) },
      include: {
        criteria_item: true
      },
      orderBy: [
        { criteria_item: { jenis: 'asc' } },
        { criteria_item: { no_urut: 'asc' } }
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
    console.log('saveScore: req.body', req.body);
    const { prodi_id: prodiUserId, criteria_item_id, skor_prodi } = req.body;
    const userId = req.user?.id;
    console.log('saveScore: userId', userId, 'prodiUserId', prodiUserId);

    // Validate input
    if (!prodiUserId || !criteria_item_id || skor_prodi === undefined) {
      console.log('saveScore: Missing required fields', { prodiUserId, criteria_item_id, skor_prodi });
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (skor_prodi < 1 || skor_prodi > 4) {
      console.log('saveScore: Invalid skor_prodi range', skor_prodi);
      return res.status(400).json({ success: false, message: 'Skor must be between 1-4' });
    }

    // Validate user belongs to the prodi or is an admin
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    console.log('saveScore: user role check result', user?.role, userId, prodiUserId);

    // Ensure prodiUserId is a number for comparison
    const numericProdiUserId = parseInt(prodiUserId);

    if (user.role !== 'TU' && userId !== numericProdiUserId) {
      console.log('saveScore: Access denied for user', userId, 'to prodi', prodiUserId);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if score exists
    const existingScore = await prisma.criteria_scores.findUnique({
      where: {
        unique_score_per_prodi: {
          user_id: numericProdiUserId,
          criteria_item_id: criteria_item_id,
        },
      },
    });
    console.log('saveScore: existingScore', existingScore);

    // Get criteria item to calculate weighted score
    const criteriaItem = await prisma.criteria_items.findUnique({
      where: { id: criteria_item_id }
    });
    console.log('saveScore: criteriaItem', criteriaItem);

    if (!criteriaItem) {
      console.log('saveScore: Criteria item not found', criteria_item_id);
      return res.status(404).json({ success: false, message: 'Criteria item not found' });
    }

    const skor_terbobot = parseFloat((skor_prodi * (criteriaItem.bobot_raw / 400)).toFixed(3));
    console.log('saveScore: calculated skor_terbobot', skor_terbobot);

    let savedScore;
    if (existingScore) {
      // If it exists, update it
      savedScore = await prisma.criteria_scores.update({
        where: {
          id: existingScore.id,
        },
        data: {
          skor_prodi: skor_prodi,
          skor_terbobot: skor_terbobot,
        },
      });
      console.log('saveScore: Updated score', savedScore);
    } else {
      // If it doesn't exist, create it
      savedScore = await prisma.criteria_scores.create({
        data: {
          user_id: numericProdiUserId,
          criteria_item_id: criteria_item_id,
          skor_prodi: skor_prodi,
          skor_terbobot: skor_terbobot,
        },
      });
      console.log('saveScore: Created score', savedScore);
    }

    res.json({ success: true, data: savedScore });
  } catch (error) {
    console.error('Error saving score:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to save score' });
  }
};

// GET /api/matriks-penilaian/summary/:prodiId
export const getSummaryByProdi = async (req, res) => {
  try {
    const { prodiId } = req.params;
    const userId = req.user?.id;

    // Validate access
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user.role !== 'TU' && userId !== parseInt(prodiId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get all scores for the prodi
    const scores = await prisma.criteria_scores.findMany({
      where: { user_id: parseInt(prodiId) },
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
