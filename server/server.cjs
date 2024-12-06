/* eslint-disable no-console */
require('moment/locale/ru');
require('dotenv').config();
const { Server } = require('socket.io');
const http = require('http');
const moment = require('moment');
const app = require('./routes/routes.cjs');
const { logger } = require('./utils/libs/logger.cjs');
const { sslOptions } = require('./utils/libs/sslOptions.cjs');

const {
  incrementPixelCount,
} = require('./utils/pixel/incrementPixelCount.cjs');
const {
  connectRedis,
} = require('./utils/functions/events/redisConnections.cjs');
const {
  authenticateSocket,
} = require('./utils/functions/events/socketAuth.cjs');
const {
  handleServerSigintEvent,
  handleServerEvents,
} = require('./utils/functions/events/handleServerEvents.cjs');
const { handleSocketEvents } = require('./handlers/socketHandlers.cjs');
const https = require("https");
moment.locale('ru');

(async () => {
  await connectRedis();

  let server = https.createServer(sslOptions, app);
  let io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });
  io.use(authenticateSocket);

  let onlineUsers = {};

  const initiateServer = (port) => {
    server = https.createServer(sslOptions, app);
    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
      },
    });

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    io.on('connection', (socket) => {
      const uniqueIdentifier = socket.handshake.auth.uniqueIdentifier;
      const origin = socket.handshake.headers.origin;

      // if (!uniqueIdentifier) {
      //   logger.warn(`Unauthorized connection attempt from IP: ${socket.handshake.address}`);
      //   socket.disconnect();
      //   return;
      // }

      if (origin !== process.env.CLIENT_URL) {
        logger.error(`Unauthorized connection attempt from origin: ${origin}`);
        socket.disconnect();
        return;
      }

      if (!onlineUsers[uniqueIdentifier]) {
        onlineUsers[uniqueIdentifier] = [];
      }
      onlineUsers[uniqueIdentifier].push(socket.id);

      logger.info(
        `User Connection - User connected with ID: ${uniqueIdentifier} from IP: ${socket.handshake.address} - Total users: ${Object.keys(onlineUsers).length}, Total connections: ${getTotalConnections()} - ${moment().format('LL LTS')}`
      );

      io.emit('user-count', {
        totalUsers: Object.keys(onlineUsers).length,
        totalConnections: getTotalConnections(),
      });

      socket.on('disconnect', () => {
        if (onlineUsers[uniqueIdentifier]) {
          onlineUsers[uniqueIdentifier] = onlineUsers[uniqueIdentifier].filter(
            (id) => id !== socket.id
          );

          if (onlineUsers[uniqueIdentifier].length === 0) {
            delete onlineUsers[uniqueIdentifier];
          }

          logger.info(
            `User Disconnection - User with ID: ${uniqueIdentifier} disconnected - Total users: ${Object.keys(onlineUsers).length}, Total connections: ${getTotalConnections()} - ${moment().format('LL LTS')}`
          );

          io.emit('user-count', {
            totalUsers: Object.keys(onlineUsers).length || 0,
            totalConnections: getTotalConnections() || 0,
          });
        }
      });

      let isServerOnline = true;
      socket.emit('server-status', { status: 'online' });

      function updateServerStatus(isOnline) {
        isServerOnline = isOnline;
        io.sockets.emit('server-status-update', {
          status: isOnline ? 'online' : 'offline',
        });
      }

      setInterval(() => {
        if (!isServerOnline) {
          updateServerStatus(true);
        }
      }, 2000);

      handleServerSigintEvent(io);

      handleSocketEvents(socket, io, onlineUsers);
    });
  };

  function getTotalConnections() {
    return Object.values(onlineUsers).reduce(
      (total, connections) => total + connections.length,
      0
    );
  }

  let isServerOnline = true;

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
      `Online Users - Total online users: ${Object.keys(onlineUsers).length} & sessions online: ${getTotalConnections()} - ${moment().format('LL LTS')}`
    );
  }, 5000);

  initiateServer(process.env.PORT);
})();

handleServerEvents();
