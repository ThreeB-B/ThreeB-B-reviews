const { db } = require('../../database/index.js');

module.exports.getReviews = (room_id) => {
  return (async () => {
    const client = await db.connect();

    try {
      const results = await client.query(`SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews as r INNER JOIN users as u
      ON u.id = r.user_id WHERE r.room_id = ${room_id}`);
      return { room_id: room_id, reviews: results.rows };
    } finally {
      client.release();
    }
  })().catch((err) => console.log(err));
}