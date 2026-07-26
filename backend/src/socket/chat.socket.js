module.exports = function registerChatSocket(io, socket) {
  socket.on('join-chat', (chatId) => {
    socket.join(`chat-${chatId}`);
    console.log(`Socket ${socket.id} joined chat-${chatId}`);
  });

  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat-${chatId}`);
  });

  socket.on('typing', ({ chatId, name }) => {
    socket.to(`chat-${chatId}`).emit('user-typing', { name });
  });

  socket.on('stop-typing', ({ chatId }) => {
    socket.to(`chat-${chatId}`).emit('user-stopped-typing');
  });
};
