const { logger } = require('../../libs/logger.cjs');
const { incrementPixelCount } = require('../../pixel/incrementPixelCount.cjs');
const moment = require('moment');
require('moment/locale/ru');
moment.locale('ru');

async function initiateInterval(io, onlineUsers, isServerOnline) {
  setInterval(() => {
    incrementPixelCount(io);

    const serverStatus = {
      onlineUsers: onlineUsers,
      serverStatus: isServerOnline ? 'online' : 'offline',
      currentDateTime: moment().format('LL LTS'),
    };

    io.emit('server-status-update', serverStatus);

    logger.info(
      `Server Status - The server file is operational - ${moment().format(
        'LL LTS'
      )}`
    );
    logger.info(
      `Online Users - Total online users: ${onlineUsers} - ${moment().format(
        'LL LTS'
      )}`
    );
  }, 5000);
}

module.exports = { initiateInterval };
