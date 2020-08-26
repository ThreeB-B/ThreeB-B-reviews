/*
 * Generate random number of reviews for each room
 * Input: number of rooms
 * Output: Array of array of reviews
 */

const casual = require('casual');
const { reviewGenerator } = require('./reviewGenerator.js');

module.exports.roomReviewGenerator = function (room_id) {
  let numOfReviews = casual.integer(from = 1, to = 25);

  return { room_id, reviews: reviewGenerator(numOfReviews) };
};
