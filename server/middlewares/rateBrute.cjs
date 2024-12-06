const expressBrute = require('express-brute');

const store = new expressBrute.MemoryStore();
const bruteforce = new expressBrute(store, {
  freeRetries: 5,
  minWait: 5000,
  maxWait: 60000,
});

module.exports = { bruteforce };