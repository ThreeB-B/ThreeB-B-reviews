const { db } = require('../../database/index.js');

module.exports.getReviews = async (room_id) => {
  let reviews;

  try {
    const [results, metadata] = await db.query(`SELECT u.name, u.profilepicnum as profilePicNum, r.* FROM reviews 
      as r INNER JOIN users as u ON u.id = r.user_id WHERE r.room_id = ${room_id}`);

    reviews = { room_id: room_id, reviews: results };
  } catch (err) {
    console.log(err);
  }

  return reviews;
}