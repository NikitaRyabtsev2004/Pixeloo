const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./canvas.db');

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        confirmationCode TEXT,
        isVerified INTEGER DEFAULT 0,
        canPlacePixel INTEGER DEFAULT 0,
        pixelCount INTEGER DEFAULT 0,
        maxPixelCount INTEGER DEFAULT 100, 
        uniqueIdentifier TEXT UNIQUE,
        subscription INTEGER DEFAULT 0
    )`,
    () => {}
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS Canvas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      x INTEGER,
      y INTEGER,
      color TEXT,
      userId INTEGER,
      UNIQUE(x, y),
      FOREIGN KEY(userId) REFERENCES Users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Canvas2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      x INTEGER,
      y INTEGER,
      color TEXT,
      userId INTEGER,
      UNIQUE(x, y),
      FOREIGN KEY(userId) REFERENCES Users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Canvas3 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      x INTEGER,
      y INTEGER,
      color TEXT,
      userId INTEGER,
      UNIQUE(x, y),
      FOREIGN KEY(userId) REFERENCES Users(id)
    )
  `);

  const generateUniqueIdentifier = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let identifier = '';
    for (let i = 0; i < 10; i++) {
      identifier += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return identifier;
  };

  bcrypt.hash('Qwe12345!', 10, (err, hashedPassword) => {
    const uniqueIdentifier = generateUniqueIdentifier();
    const hashedIdentifier = bcrypt.hashSync(uniqueIdentifier, 10);
    db.run(
      `INSERT OR IGNORE INTO Users 
         (email, username, password, confirmationCode, isVerified, canPlacePixel, pixelCount, maxPixelCount, subscription, uniqueIdentifier) 
         VALUES ('nekita118118@gmail.com', 'Nikita111', ?, '', 1, 1, 100, 100, 0, ?)`,
      [hashedPassword, hashedIdentifier],
      () => {}
    );
  });
});

module.exports = db;
