const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sslOptions = {
    key: fs.readFileSync(path.join(process.env.KEY_PEM)),
    cert: fs.readFileSync(path.join(process.env.CERT_PEM)),
  };

module.exports = {sslOptions}