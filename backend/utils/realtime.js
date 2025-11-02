const { Server } = require('socket.io');

let io;

function init(server) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
  });
  return io;
}

function getIO() {
  return io;
}

function emitAutomation(type, message, meta = {}) {
  try {
    if (!io) return;
    io.emit('automation:notification', {
      type,
      message,
      meta,
      ts: Date.now(),
    });
  } catch (_) {}
}

module.exports = { init, getIO, emitAutomation };
