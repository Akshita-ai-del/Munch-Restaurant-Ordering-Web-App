const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// Helper: get or create cart
async function getOrCreateCart(sessionId, userId) {
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { menuItem: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId, userId },
      include: { items: { include: { menuItem: true } } },
    });
  }
  return cart;
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });
    const cart = await getOrCreateCart(sessionId, req.user?.id);
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart/items
router.post('/items', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.body.sessionId;
    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });
    const { menuItemId, quantity = 1, addons, specialNote } = req.body;

    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem) return res.status(404).json({ error: 'Item not found' });

    const cart = await getOrCreateCart(sessionId, req.user?.id);

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId,
        quantity: Number(quantity),
        addons: addons ? JSON.stringify(addons) : null,
        specialNote,
        unitPrice: menuItem.price,
      },
      include: { menuItem: true },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { menuItem: true } } },
    });
    res.status(201).json({ cartItem, cart: updatedCart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: req.params.itemId } });
      return res.json({ message: 'Item removed' });
    }
    const cartItem = await prisma.cartItem.update({
      where: { id: req.params.itemId },
      data: { quantity: Number(quantity) },
      include: { menuItem: true },
    });
    res.json({ cartItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// DELETE /api/cart  — clear cart
router.delete('/', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
