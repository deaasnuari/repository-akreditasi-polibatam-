import prisma from '../prismaClient.js';

// Create a review (requires authentication middleware to set req.user)
export const createReview = async (req, res) => {
  try {
    const { module, itemId, note } = req.body;
    console.log(`💬 createReview called: module=${module}, itemId=${itemId}, user=${req.user?.id}`);
    
    if (!module || !itemId || !note) {
      return res.status(400).json({ success: false, message: 'module, itemId, and note are required' });
    }

    const newReview = await prisma.reviews.create({
      data: {
        module,
        item_id: Number(itemId),
        reviewer_id: req.user.id,
        note,
      },
      include: { user: { select: { id: true, nama_lengkap: true, username: true } } }
    });

    console.log(`✅ createReview created review id=${newReview.id}`);
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
