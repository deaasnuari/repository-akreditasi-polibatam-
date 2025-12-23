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
