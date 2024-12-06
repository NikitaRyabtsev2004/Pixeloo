/* eslint-disable no-console */
const db = require('../database/dbSetup.cjs');
const { logger } = require('../utils/libs/logger.cjs');
const moment = require('moment');
const { sendUserPixelCount } = require('../utils/pixel/sendUserPixelCount.cjs');
require('moment/locale/ru');
moment.locale('ru');

function getUserData(uniqueIdentifier, socket) {
    db.get(
        'SELECT id, username, email, pixelCount, lastLogin FROM Users WHERE uniqueIdentifier = ?',
        [uniqueIdentifier],
        (err, user) => {
          if (err) {
            logger.error('Database error:', err.message);
            return;
          }

          if (!user) {
            return socket.emit('error', { message: 'User not found' });
          }

          socket.emit('user-status', {
            username: user.username,
            email: user.email,
            pixelCount: user.pixelCount,
            lastLogin: user.lastLogin,
          });
        }
      );
}

function getUserName(tableName, callback, x, y) {
    db.get(
        `SELECT userId FROM ${tableName} WHERE x = ? AND y = ?`,
        [x, y],
        (err, pixelRow) => {
          if (err) {
            console.error('Ошибка базы данных:', err.message);
            return callback({ success: false, message: 'Database error' });
          }

          if (!pixelRow || !pixelRow.userId) {
            return callback({ success: false, message: 'Pixel not found' });
          }

          const userId = pixelRow.userId;

          db.get(
            `SELECT username FROM Users WHERE uniqueIdentifier = ?`,
            [userId],
            (err, userRow) => {
              if (err) {
                console.error(
                  'Ошибка получения данных пользователя:',
                  err.message
                );
                return callback({
                  success: false,
                  message: 'Database error',
                });
              }

              if (userRow && userRow.username) {
                return callback({
                  success: true,
                  username: userRow.username,
                });
              } else {
                return callback({
                  success: false,
                  message: 'User not found',
                });
              }
            }
          );
        }
      );
}

function getCanvasStatus(canvasName, socket, route) {
    db.all(`SELECT x, y, color FROM ${canvasName}`, [], (err, rows) => {
        if (err) {
          const logMessage = `Canvas Status (${canvasName}) - Database error: ${
            err.message
          } - ${moment().format('LL LTS')}`;
          logger.error(logMessage);
          return;
        }

        const logMessage = `Canvas Status (${canvasName}) - Successfully fetched ${
          rows.length
        } data points - ${moment().format('LL LTS')}`;
        logger.info(logMessage);
        socket.emit(`canvas-data-${route.slice(-1)}`, rows);
      });
}

function setDrawPixel(uniqueIdentifier, socket) {
  db.run(
    'UPDATE Users SET pixelCount = pixelCount - 1 WHERE uniqueIdentifier = ? AND pixelCount > 0',
    [uniqueIdentifier],
    (updateErr) => {
      if (updateErr) {
        logger.error('Database error:', updateErr.message);
        return;
      }
      sendUserPixelCount(socket, uniqueIdentifier);
    }
  );
}

function getMaxPixelCount(uniqueIdentifier, socket) {
    db.get(
        'SELECT maxPixelCount FROM Users WHERE uniqueIdentifier = ?',
        [uniqueIdentifier],
        (err, row) => {
          if (err) {
            console.error('Ошибка при запросе maxPixelCount:', err.message);
            return;
          }

          if (row) {
            socket.emit('max-pixel-count-update', {
              maxPixelCount: row.maxPixelCount,
            });
          }
        }
      );
}

function updateMaxPixelCount(uniqueIdentifier, newMaxPixelCount, callback) {
  db.run(
    'UPDATE Users SET maxPixelCount = ? WHERE uniqueIdentifier = ?',
    [newMaxPixelCount, uniqueIdentifier],
    function (err) {
      if (err) {
        console.error('Error updating maxPixelCount:', err.message);
        callback({ success: false, message: 'Database update failed' });
        return;
      }

      if (this.changes > 0) {
        callback({ success: true });
      } else {
        callback({
          success: false,
          message: 'No user found with the given uniqueIdentifier',
        });
      }
    }
  );
}

module.exports = { setDrawPixel, getUserData, getMaxPixelCount, updateMaxPixelCount, getUserName, getCanvasStatus };
