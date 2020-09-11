const { Sequelize } = require('sequelize');
const {
  username,
  password,
  rep_user,
  rep_pass
} = require('./config');

const MASTER_HOST = "34.221.63.95";
const REP1_HOST = "54.201.145.150";
const REP2_HOST = "34.214.70.79";

module.exports.db = new Sequelize('3bb-reviews', null, null, {
  dialect: "postgres",
  port: 5432,
  replication: {
    read: [
      { host: REP1_HOST, username: "rep_user", password: rep_pass},
      { host: REP2_HOST, username: "rep_user", password: rep_pass}
    ],
    write: { host: MASTER_HOST, username: username, password: password }
  }
});
