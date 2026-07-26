const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, avatarUrl },
      select: { id: true, email: true, name: true, phone: true, role: true, avatarUrl: true },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/addresses
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ addresses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// POST /api/users/addresses
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const { label, line1, line2, city, state, zip, country, lat, lng, isDefault } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { userId: req.user.id, label, line1, line2, city, state, zip, country, lat, lng, isDefault: isDefault || false },
    });
    res.status(201).json({ address });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', authenticate, async (req, res) => {
  try {
    await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// GET /api/users/favourites
router.get('/favourites', authenticate, async (req, res) => {
  try {
    const favourites = await prisma.favourite.findMany({
      where: { userId: req.user.id },
      include: { menuItem: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ favourites });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

// POST /api/users/favourites
router.post('/favourites', authenticate, async (req, res) => {
  try {
    const { menuItemId } = req.body;
    const fav = await prisma.favourite.upsert({
      where: { userId_menuItemId: { userId: req.user.id, menuItemId } },
      update: {},
      create: { userId: req.user.id, menuItemId },
    });
    res.status(201).json({ favourite: fav });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

// DELETE /api/users/favourites/:menuItemId
router.delete('/favourites/:menuItemId', authenticate, async (req, res) => {
  try {
    await prisma.favourite.deleteMany({ where: { userId: req.user.id, menuItemId: req.params.menuItemId } });
    res.json({ message: 'Removed from favourites' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

module.exports = router;
