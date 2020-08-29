/*
 * Airbnb fake reviews generator
 * Library: casual (npm install casual)
 * Input: Number of reviews
 * Output: An array of random reviews
 */

const casual = require('casual');
const { users } = require('./userGenerator');
const { sentences } = require('./sentenceGenerator');

const reviewGenerator = function (numberOfData) {
  let res = [];
  const months = ["July", "August", "September"];
  const stars = [1, 2, 3, 4, 5];
  const starIndexFrom = 0;
  const starIndexTo = 4;

  for (let i = 0; i < numberOfData; i++) {
    const curData = {};
    let sentenceIndex = casual.integer(0,999);
    let userIndex = casual.integer(0,999);
    let { name, profilePicNum } = users[userIndex];

    // name
    curData.name = name;

    // profilePicNum
    curData.profilePicNum = profilePicNum;

    // date
    let monthIndex = casual.integer(0, 2);
    let month = months[monthIndex]
    curData.date = `${month} 2020`;

    // sentence
    curData.sentence = sentences[sentenceIndex];

    // rating_accuracy
    let ratingIndex = casual.integer(starIndexFrom, starIndexTo);
    curData.accuracy_rating = stars[ratingIndex];

    // rating_communication
    ratingIndex = casual.integer(starIndexFrom, starIndexTo);
    curData.communication_rating = stars[ratingIndex];

    // rating_cleanliness
    ratingIndex = casual.integer(starIndexFrom, starIndexTo);
    curData.cleanliness_rating = stars[ratingIndex];

    // rating_location
    ratingIndex = casual.integer(starIndexFrom, starIndexTo);
    curData.location_rating = stars[ratingIndex];

    // rating_check_in
    ratingIndex = casual.integer(starIndexFrom, starIndexTo);
    curData.check_in_rating = stars[ratingIndex];

    // rating_value
    ratingIndex = casual.integer(starIndexFrom, starIndexTo);
    curData.value_rating = stars[ratingIndex];

    // overall_rating = ratings above / 6
    ratingIndex = Math.floor((curData.accuracy_rating
      + curData.communication_rating
      + curData.cleanliness_rating
      + curData.location_rating
      + curData.check_in_rating
      + curData.value_rating) / 6);
    curData.overall_rating = stars[ratingIndex];
    res.push(curData);
  }

  return res;
};


module.exports.reviews = reviewGenerator(1000);
