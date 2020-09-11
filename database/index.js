const { Pool } = require('pg');
const { username, password } = require('./config');

const db = new Pool({
  user: username,
  password: password,
  host: 'localhost',
  database: '3bb-reviews',
  port: '5432'
});

module.exports = {
  db
}