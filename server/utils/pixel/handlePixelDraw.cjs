const db = require('../../database/dbSetup.cjs');
const { logger } = require('../libs/logger.cjs');
const { redisClientPub, isRedisConnected } = require('../libs/redis.cjs');

async function handlePixelDraw(x, y, color, userId, io, route) {
  const tableName =
    route === '/canvas-2'
      ? 'Canvas2'
      : route === '/canvas-3'
        ? 'Canvas3'
        : 'Canvas';

  db.get(
    `SELECT color, userId FROM ${tableName} WHERE x = ? AND y = ?`,
    [x, y],
    (err, row) => {
      if (err) {
        logger.error('Database error:', err.message);
        return;
      }

      const queryCallback = (err) => {
        if (err) {
          logger.error('Database error:', err.message);
          return;
        }

        if (isRedisConnected) {
          redisClientPub.publish(
            route === '/canvas-2'
              ? 'pixel-channel-2'
              : route === '/canvas-3'
                ? 'pixel-channel-3'
                : 'pixel-channel',
            JSON.stringify({ x, y, color })
          );
        }

        io.emit(
          route === '/canvas-2'
            ? 'pixel-drawn-2'
            : route === '/canvas-3'
              ? 'pixel-drawn-3'
              : 'pixel-drawn-1',
          [{ x, y, color }]
        );
      };

      if (row) {
        db.run(
          `UPDATE ${tableName} SET color = ?, userId = ? WHERE x = ? AND y = ?`,
          [color, userId, x, y],
          queryCallback
        );
      } else {
        db.run(
          `INSERT INTO ${tableName} (x, y, color, userId) VALUES (?, ?, ?, ?)`,
          [x, y, color, userId],
          queryCallback
        );
      }
    }
  );
}

module.exports = { handlePixelDraw };
