const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/reviews
router.post('/', authenticate, async (req, res) => {
  try {
    const { orderId, rating, comment, menuItemId } = req.body;
    if (!orderId || !rating) return res.status(400).json({ error: 'orderId and rating required' });

    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) return res.status(409).json({ error: 'Review already submitted for this order' });

    const review = await prisma.review.create({
      data: { orderId, userId: req.user.id, rating: Number(rating), comment, menuItemId: menuItemId || null },
    });
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// GET /api/reviews/item/:menuItemId
router.get('/item/:menuItemId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { menuItemId: req.params.menuItemId },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ reviews, averageRating: avg, count: reviews.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
