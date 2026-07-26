const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/chat/:orderId
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { orderId: req.params.orderId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// POST /api/chat/:orderId/messages
router.post('/:orderId/messages', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Message content required' });

    const chat = await prisma.chat.findUnique({ where: { orderId: req.params.orderId } });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: req.user.id,
        senderName: req.user.name,
        senderRole: req.user.role,
        content: content.trim(),
      },
    });

    const io = req.app.get('io');
    if (io) io.to(`chat-${chat.id}`).emit('new-message', message);

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
