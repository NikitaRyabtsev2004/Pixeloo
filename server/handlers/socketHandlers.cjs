const { logger } = require('../utils/libs/logger.cjs');
const { handlePixelDraw } = require('../utils/pixel/handlePixelDraw.cjs');
const { sendUserPixelCount } = require('../utils/pixel/sendUserPixelCount.cjs');
const {
  getMaxPixelCount,
  getUserData,
  getUserName,
  getCanvasStatus,
  updateMaxPixelCount,
  setDrawPixel,
} = require('../database/dbQueries.cjs');
const moment = require('moment');
const { checkAndEmitPixelStatus } = require('../utils/pixel/checkAndEmitPixelStatus.cjs');

function handleSocketEvents(socket, io, onlineUsers) {
  let uniqueIdentifier = socket.handshake.auth.uniqueIdentifier;
  let currentRoute;

  // if (!uniqueIdentifier) {
  //   socket.disconnect();
  //   return;
  // }

  socket.emit('server-status', { status: 'online' });

  setInterval(() => {
    checkAndEmitPixelStatus(socket, uniqueIdentifier);
    getMaxPixelCount(uniqueIdentifier, socket);
  }, 5000);

  socket.on('check-server-status', (callback) => {
    callback({ status: 'online' });
  });

  socket.on('client-info', (data) => {
    uniqueIdentifier = data.uniqueIdentifier;
    getUserData(uniqueIdentifier, socket);
    sendUserPixelCount(socket, uniqueIdentifier);
  });

  socket.on('get-username', (data, callback) => {
    const { x, y } = data;
    const tableName =
      currentRoute === '/canvas-2'
        ? 'Canvas2'
        : currentRoute === '/canvas-3'
          ? 'Canvas3'
          : 'Canvas';
    getUserName(tableName, callback, x, y);
  });

  socket.on('route', (route) => {
    currentRoute = route;
    const canvasName =
      route === '/canvas-2'
        ? 'Canvas2'
        : route === '/canvas-3'
          ? 'Canvas3'
          : 'Canvas';
    getCanvasStatus(canvasName, socket, route);
  });

  socket.on('get-max-pixel-count', () => {
    const uniqueIdentifier = socket.handshake.auth.uniqueIdentifier;
    getMaxPixelCount(uniqueIdentifier, socket);
  });

  socket.on('update-max-pixel-count', (data, callback) => {
    const { newMaxPixelCount } = data;
    const uniqueIdentifier = socket.handshake.auth.uniqueIdentifier;

    if (!newMaxPixelCount || typeof newMaxPixelCount !== 'number') {
      callback({ success: false, message: 'Invalid maxPixelCount value' });
      return;
    }

    updateMaxPixelCount(uniqueIdentifier, newMaxPixelCount, callback);
  });

  socket.on('draw-pixel', async (pixelData) => {
    const currentIdentifier = uniqueIdentifier;
    try {
      const { x, y, color, userId } = pixelData;
  
      if (currentRoute === '/canvas-1') {
        await handlePixelDraw(x, y, color, userId, io, '/canvas-1');
      } else if (currentRoute === '/canvas-2') {
        await handlePixelDraw(x, y, color, userId, io, '/canvas-2');
      } else if (currentRoute === '/canvas-3') {
        await handlePixelDraw(x, y, color, userId, io, '/canvas-3');
      }
  
      setDrawPixel(currentIdentifier, socket); 
    } catch (err) {
      logger.error('Error handling pixel draw:', err.message);
    }
  });
  
  socket.on('disconnect', () => {
    onlineUsers = Math.max(onlineUsers - 1, 0);
    const logMessage = `User Disconnection - User disconnected from IP: ${
      socket.handshake.address
    } - Total online users: ${Object.keys(onlineUsers).length} - ${moment().format('LL LTS')}`;
    logger.info(logMessage);
    io.emit('user-count', onlineUsers);
  });
}

module.exports = { handleSocketEvents };
