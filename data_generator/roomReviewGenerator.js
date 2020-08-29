/*
 * Generate random number of reviews for each room
 * Input: number of rooms
 * Output: Array of array of reviews
 */

const casual = require('casual');
const { reviews } = require('./reviewGenerator.js');

module.exports.roomReviewGenerator = function (room_id) {
  let numOfReviews = casual.integer(from = 1, to = 25);
  let roomReviews = [];

  for (let i = 0; i < numOfReviews; i++) {
    let index = casual.integer(0, 999);
    let review = reviews[index]
    review.id = i + 1;
    roomReviews.push(review);
  }

  return { room_id, reviews: roomReviews };
};
