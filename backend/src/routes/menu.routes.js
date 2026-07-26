const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/menu/categories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/menu  — supports ?category=slug&search=q&featured=true&popular=true
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, popular } = req.query;
    const where = { isAvailable: true };

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (featured === 'true') where.isFeatured = true;
    if (popular === 'true') where.isPopular = true;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: true, addons: true },
      orderBy: [{ isFeatured: 'desc' }, { isPopular: 'desc' }, { name: 'asc' }],
    });

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: { category: true, addons: true, reviews: { include: { user: { select: { name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

module.exports = router;
