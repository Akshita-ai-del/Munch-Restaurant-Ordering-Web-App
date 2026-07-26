const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/wallet
router.get('/', authenticate, async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    res.json({ wallet });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// POST /api/wallet/topup
router.post('/topup', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const wallet = await prisma.wallet.update({
      where: { userId: req.user.id },
      data: {
        balance: { increment: Number(amount) },
        transactions: { create: { type: 'topup', amount: Number(amount), description: `Top-up $${amount}` } },
      },
    });
    res.json({ wallet });
  } catch (err) {
    res.status(500).json({ error: 'Failed to top up wallet' });
  }
});

module.exports = router;
