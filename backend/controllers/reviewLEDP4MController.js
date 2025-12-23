import prisma from "../prismaClient.js";

/**
 * GET - Ambil semua LED yang sudah disubmit untuk review
 * Status = "Submitted", "Approved", "NeedsRevision" di BuktiPendukung
 */
export const getAllSubmittedLED = async (req, res) => {
  try {
    console.log('📥 [Review LED] Fetching all submitted LEDs');
    
    // Ambil semua BuktiPendukung dengan status "Submitted", "Approved", atau "NeedsRevision"
    const submittedItems = await prisma.buktiPendukung.findMany({
      where: { 
        status: {
          in: ['Submitted', 'Approved', 'NeedsRevision']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nama_lengkap: true,
            prodi: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`✅ [Review LED] Found ${submittedItems.length} items (Submitted/Approved/NeedsRevision)`);
    
    res.json(submittedItems);
  } catch (error) {
    console.error("❌ [Review LED] Error fetching submitted LEDs:", error);
    res.status(500).json({ message: "Gagal mengambil data LED yang disubmit" });
  }
};

/**
 * POST - Submit review (catatan + status) untuk LED tertentu
 * Body: { tab, status, notes, reviewed_user_id }
 */
export const submitLEDReview = async (req, res) => {
  try {
    const { tab, status, notes, reviewed_user_id } = req.body;
    const reviewer_id = req.user?.id;

    if (!reviewer_id) {
      return res.status(401).json({ message: "User tidak terautentikasi" });
    }

    if (!tab || !status || !reviewed_user_id) {
      return res.status(400).json({ message: "tab, status, dan reviewed_user_id wajib diisi" });
    }

    console.log(`💾 [Review LED] Reviewer ${reviewer_id} reviewing user ${reviewed_user_id}, tab: ${tab}`);
    console.log(`   → Status: ${status}, Notes: ${notes?.substring(0, 50)}...`);

    // Update status di BuktiPendukung
    const updatedBukti = await prisma.buktiPendukung.updateMany({
      where: {
        userId: Number(reviewed_user_id),
        path: {
          contains: `tab=${tab}`
        }
      },
      data: {
        status: status === 'Diterima' ? 'Approved' : 'NeedsRevision'
      }
    });

    // Simpan catatan review di table reviews
    const review = await prisma.reviews.create({
      data: {
        module: 'LED',
        item_id: Number(reviewed_user_id),
        reviewer_id: reviewer_id,
        note: `[${tab}] Status: ${status}\n${notes || 'Tidak ada catatan'}`
      }
    });

    console.log(`✅ [Review LED] Review saved (id: ${review.id}), updated ${updatedBukti.count} BuktiPendukung records`);

    res.json({
      success: true,
      message: 'Review berhasil disimpan',
      review,
      updatedCount: updatedBukti.count
    });
  } catch (error) {
    console.error("❌ [Review LED] Error submitting review:", error);
    res.status(500).json({ message: "Gagal menyimpan review", error: error.message });
  }
};

/**
 * GET - Ambil history review untuk user tertentu
 * Params: user_id
 */
export const getReviewHistory = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const reviews = await prisma.reviews.findMany({
      where: {
        module: 'LED',
        item_id: Number(user_id)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nama_lengkap: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error("❌ [Review LED] Error fetching review history:", error);
    res.status(500).json({ message: "Gagal mengambil history review" });
  }
};

/**
 * POST - Mark dokumen as completed (akan di-archive/status jadi Completed)
 * Body: { buktiPendukungId }
 */
export const markAsCompleted = async (req, res) => {
  try {
    const { buktiPendukungId } = req.body;

    if (!buktiPendukungId) {
      return res.status(400).json({ message: "buktiPendukungId is required" });
    }

    console.log(`✅ [Review LED] Marking BuktiPendukung ${buktiPendukungId} as completed`);

    // Update status menjadi "Completed" untuk menyembunyikan dari dashboard P4M
    const updated = await prisma.buktiPendukung.update({
      where: { id: Number(buktiPendukungId) },
      data: { status: 'Completed' }
    });

    console.log(`✅ [Review LED] Successfully marked as completed`);

    res.json({
      success: true,
      message: 'Dokumen berhasil ditandai sebagai selesai',
      data: updated
    });
  } catch (error) {
    console.error("❌ [Review LED] Error marking as completed:", error);
    res.status(500).json({ message: "Gagal menandai dokumen sebagai selesai" });
  }
};

