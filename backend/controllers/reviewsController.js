import prisma from '../prismaClient.js';

// Create a review (requires authentication middleware to set req.user)
export const createReview = async (req, res) => {
  try {
    const { module, itemId, note, status } = req.body;
    console.log(`💬 createReview called: module=${module}, itemId=${itemId}, status=${status}, user=${req.user?.id}`);
    
    if (!module || !itemId || !note) {
      return res.status(400).json({ success: false, message: 'module, itemId, and note are required' });
    }

    const newReview = await prisma.reviews.create({
      data: {
        module,
        item_id: Number(itemId),
        reviewer_id: req.user.id,
        note,
        status: status || 'Diterima', // Default ke 'Diterima' jika tidak ada
      },
      include: { user: { select: { id: true, nama_lengkap: true, username: true } } }
    });

    console.log(`✅ createReview created review id=${newReview.id} with status=${newReview.status}`);

    // ===== Propagate review status to Bukti Pendukung (aggregate per LKPS module) =====
    try {
      // Map module -> prisma table + bukti pendukung path
      const MODULE_CFG = {
        'budaya-mutu': { table: 'budaya_mutu', path: '/dashboard/tim-akreditasi/lkps', label: 'Budaya Mutu' },
        'relevansi-pendidikan': { table: 'relevansi_pendidikan', path: '/dashboard/tim-akreditasi/lkps/relevansi-pendidikan', label: 'Relevansi Pendidikan' },
        'relevansi-penelitian': { table: 'relevansi_penelitian', path: '/dashboard/tim-akreditasi/lkps/relevansi-penelitian', label: 'Relevansi Penelitian' },
        'relevansi-pkm': { table: 'relevansi_pkm', path: '/dashboard/tim-akreditasi/lkps/relevansi-pkm', label: 'Relevansi PkM' },
        'akuntabilitas': { table: 'akuntabilitas', path: '/dashboard/tim-akreditasi/lkps/akuntabilitas', label: 'Akuntabilitas' },
        'diferensiasi-misi': { table: 'diferensiasi_misi', path: '/dashboard/tim-akreditasi/lkps/diferensiasi-misi', label: 'Diferensiasi Misi' },
      };

      const cfg = MODULE_CFG[module];
      if (cfg && prisma[cfg.table]) {
        // 1) Get owner (user_id) of the reviewed item
        const ownerRow = await prisma[cfg.table].findUnique({
          where: { id: Number(itemId) },
          select: { user_id: true }
        });

        if (ownerRow?.user_id) {
          const ownerId = ownerRow.user_id;

          // 2) Get all item ids for this user within the same module/table
          const allItems = await prisma[cfg.table].findMany({
            where: { user_id: ownerId },
            select: { id: true },
            orderBy: { id: 'asc' }
          });
          const itemIds = allItems.map(r => r.id);

          // 3) Fetch all reviews for these items in this module
          const allReviews = await prisma.reviews.findMany({
            where: { module, item_id: { in: itemIds } },
            orderBy: { created_at: 'desc' }
          });

          // 4) Build latest status per item
          const latestStatusByItem = new Map();
          for (const r of allReviews) {
            if (!latestStatusByItem.has(r.item_id)) {
              latestStatusByItem.set(r.item_id, (r.status || '').trim());
            }
          }

          // 5) Decide aggregate status for Bukti Pendukung
          let aggregate = 'Submitted'; // default remains waiting
          const statuses = Array.from(latestStatusByItem.values());
          const hasPerluRevisi = statuses.some(s => (s || '').toLowerCase() === 'perlu revisi');
          const allDiterima = statuses.length > 0 && statuses.every(s => (s || '').toLowerCase() === 'diterima');

          if (hasPerluRevisi) aggregate = 'NeedsRevision';
          else if (allDiterima && latestStatusByItem.size === itemIds.length) aggregate = 'Approved';

          // 6) Upsert Bukti Pendukung entry for this module path
          const existingBP = await prisma.buktiPendukung.findFirst({
            where: { userId: ownerId, path: cfg.path },
            orderBy: { updatedAt: 'desc' }
          });

          let bpEntry;
          if (existingBP) {
            bpEntry = await prisma.buktiPendukung.update({
              where: { id: existingBP.id },
              data: { status: aggregate }
            });
          } else {
            bpEntry = await prisma.buktiPendukung.create({
              data: {
                nama: `LKPS - ${cfg.label}`,
                path: cfg.path,
                status: aggregate,
                userId: ownerId,
              }
            });
          }

          console.log(`🔁 Aggregated status for user=${ownerId}, module=${module} -> ${aggregate} (BuktiPendukung id=${bpEntry.id})`);
        } else {
          console.warn(`⚠️ Unable to resolve owner for module=${module}, itemId=${itemId}`);
        }
      } else {
        console.warn(`⚠️ No module config or table for module=${module}`);
      }
    } catch (aggErr) {
      console.error('❌ Error while aggregating LKPS status:', aggErr);
      // do not fail request due to aggregation error
    }

    res.json({ success: true, data: newReview });
  } catch (err) {
    console.error('❌ createReview error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};

// Get reviews for a module/item or for a module
export const getReviews = async (req, res) => {
  try {
    const { module, itemId } = req.query;
    console.log(`📖 getReviews called: module=${module}, itemId=${itemId}, user=${req.user?.id}`);
    
    if (!module) return res.status(400).json({ success: false, message: 'module query param is required' });

    const where = { module };
    if (itemId) where.item_id = Number(itemId);

    const reviews = await prisma.reviews.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { id: true, nama_lengkap: true, username: true } } }
    });

    console.log(`✅ getReviews returned ${reviews.length} reviews`);
    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('❌ getReviews error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ deleteReview called: id=${id}, user=${req.user?.id}`);
    
    if (!id) return res.status(400).json({ success: false, message: 'Review id is required' });

    // Check if review exists
    const review = await prisma.reviews.findUnique({
      where: { id: Number(id) }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Delete the review
    await prisma.reviews.delete({
      where: { id: Number(id) }
    });

    console.log(`✅ deleteReview deleted review id=${id}`);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('❌ deleteReview error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};
