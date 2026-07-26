const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

function generateOrderNumber() {
  return 'MN-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
}

// POST /api/orders — place order
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      items, addressId, orderType = 'delivery', tableNumber,
      paymentMethod = 'cash', promoCode, specialNote,
      subtotal, deliveryFee = 0, tax, tip = 0, discount = 0, total,
    } = req.body;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: req.user.id,
        addressId: addressId || null,
        orderType,
        tableNumber: tableNumber || null,
        paymentMethod,
        promoCode: promoCode || null,
        specialNote: specialNote || null,
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee),
        tax: Number(tax),
        tip: Number(tip),
        discount: Number(discount),
        total: Number(total),
        estimatedTime: orderType === 'delivery' ? 35 : 15,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            addons: item.addons ? JSON.stringify(item.addons) : null,
            specialNote: item.specialNote || null,
          })),
        },
        chat: { create: {} },
      },
      include: { items: true, address: true, chat: true },
    });

    // Emit real-time event to staff
    const io = req.app.get('io');
    if (io) io.to('staff-room').emit('new-order', order);

    res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/orders — my orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: { items: true, address: true, review: true },
      orderBy: { placedAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/all — staff: all orders
router.get('/all', authenticate, async (req, res) => {
  try {
    if (!['staff', 'admin', 'rider'].includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    const orders = await prisma.order.findMany({
      include: { items: true, customer: { select: { name: true, email: true, phone: true } }, address: true },
      orderBy: { placedAt: 'desc' },
      take: 100,
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { menuItem: true } },
        address: true,
        review: true,
        chat: { include: { messages: { orderBy: { createdAt: 'asc' }, take: 50 } } },
        customer: { select: { name: true, email: true, phone: true } },
        rider: { select: { name: true, phone: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:id/status — update order status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const updateData = { status };
    if (status === 'confirmed') updateData.confirmedAt = new Date();
    if (status === 'preparing') updateData.preparedAt = new Date();
    if (status === 'out_for_delivery') updateData.pickedUpAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
    });

    const io = req.app.get('io');
    if (io) io.to(`order-${req.params.id}`).emit('order-status-updated', { orderId: req.params.id, status });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// POST /api/orders/:id/reorder
router.post('/:id/reorder', authenticate, async (req, res) => {
  try {
    const oldOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!oldOrder) return res.status(404).json({ error: 'Order not found' });
    res.json({ items: oldOrder.items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

module.exports = router;
