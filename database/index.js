const { Pool } = require('pg');
const { username, password } = require('./config');

const db = new Pool({
  user: username,
  password: password,
  host: '172.31.13.236',
  database: '3bb-reviews',
  port: '5432'
});

module.exports = {
  db
}
