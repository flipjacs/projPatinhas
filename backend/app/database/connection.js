const mysql = require('mysql2/promise');
const env = require('../config/env');

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // mysql2 já usa prepared statements quando passamos parâmetros via `?`.
  // dateStrings evita perda de fuso/precisão entre Node e MySQL.
  dateStrings: false,
  timezone: 'Z',
});

module.exports = pool;
