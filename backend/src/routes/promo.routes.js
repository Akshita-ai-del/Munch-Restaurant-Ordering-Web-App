const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/promo/validate
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Promo code required' });

    const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!promo || !promo.isActive) return res.status(404).json({ error: 'Invalid promo code' });
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt))
      return res.status(400).json({ error: 'Promo code has expired' });
    if (promo.maxUses && promo.usedCount >= promo.maxUses)
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    if (orderTotal < promo.minOrderAmount)
      return res.status(400).json({ error: `Minimum order $${promo.minOrderAmount} required` });

    let discountAmount = 0;
    if (promo.discountType === 'percent') discountAmount = (orderTotal * promo.discountValue) / 100;
    else discountAmount = promo.discountValue;
    discountAmount = Math.min(discountAmount, orderTotal);

    res.json({ promo, discountAmount: Number(discountAmount.toFixed(2)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
});

module.exports = router;
