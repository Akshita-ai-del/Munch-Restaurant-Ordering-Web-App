module.exports = function registerOrderSocket(io, socket) {
  // Join an order room to receive live updates
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`Socket ${socket.id} joined order-${orderId}`);
  });

  // Staff join room
  socket.on('join-staff', () => {
    socket.join('staff-room');
    console.log(`Staff socket ${socket.id} joined staff-room`);
  });

  // Rider joins order
  socket.on('rider-location-update', ({ orderId, lat, lng }) => {
    io.to(`order-${orderId}`).emit('rider-location', { lat, lng, timestamp: new Date() });
  });

  socket.on('leave-order', (orderId) => {
    socket.leave(`order-${orderId}`);
  });
};
