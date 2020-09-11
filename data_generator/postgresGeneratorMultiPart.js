const fs = require('fs');
const path = require('path');
const { users } = require('./userGenerator');
const { reviews } = require('./reviewGenerator');

const ROOMS_DIR = path.resolve(__dirname, 'data', 'rooms.csv');
const USERS_DIR = path.resolve(__dirname, 'data', 'users.csv');

const generateReviews = (times) => {
  return new Promise(async (resolve,reject) => {
    let totalReviews = 31499692;
    let hasSpace = true;
    let failed = false;
    let tenPercent = Math.floor(times / 10);
    let mil = 9;
    const REVIEWS_DIR = path.resolve(__dirname, 'data', `reviews${mil}.csv`);
    const writeable = fs.createWriteStream(REVIEWS_DIR);
    writeable.on('finish', () => {
      resolve();
    });
    writeable.on('error', (err) => {
      failed = true;
      console.log(err);
      reject();
    });

    writeable.write(`id,room_id,user_id,accuracy_rating,communication_rating,cleanliness_rating,location_rating,check_in_rating,value_rating,overall_rating,date,sentence`);
    
    for(let i = mil * 1000000; i < mil * 1000000; i++) {
      const reviewCount = Math.floor(Math.random() * 8);

      if (failed) {
        break;
      }

      if (i > 0 && i % tenPercent === 0) {
        console.log(`Reviews: Completed ${i} records.`);
      }

      for(let j = 0; j < reviewCount; j++, totalReviews++) {
        const reviewIndex = Math.floor(Math.random() * 1000);
        const userId = Math.floor(Math.random() * 10000000);
        const { 
          date, 
          sentence,
          accuracy_rating,
          communication_rating,
          cleanliness_rating,
          location_rating,
          check_in_rating,
          value_rating,
          overall_rating 
        } = reviews[reviewIndex];

        hasSpace = writeable.write(`\n${totalReviews},${i},${userId},${accuracy_rating},${communication_rating},${cleanliness_rating},${location_rating},${check_in_rating},${value_rating},${overall_rating},${date},${sentence}`);

        if (!hasSpace) {
          await new Promise((resolve, reject) => writeable.once('drain', resolve));
        }
      }
    }

    console.log(`Created ${totalReviews} total reviews.`);
    writeable.end();
  });
};

const postgresGenerator = (times) => {
  return generateReviews(times)
    .then(() => console.log("Data Generation Complete"))
    .catch(() => console.log('Data Generation Failed'));
}

postgresGenerator(1000000);
