const { Pool } = require('pg');
const { username, password } = require('./config');

const db = new Pool({
  user: username,
  password: password,
  host: process.env.DB_URL,
  database: '3bb-reviews',
  port: '5432'
});

module.exports = {
  db
}