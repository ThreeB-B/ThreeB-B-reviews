const fs = require('fs');
const path = require('path');
const { users } = require('./userGenerator');
const { reviews } = require('./reviewGenerator');

const ROOMS_DIR = path.resolve(__dirname, 'data', 'rooms.csv');
const USERS_DIR = path.resolve(__dirname, 'data', 'users.csv');
const REVIEWS_DIR = path.resolve(__dirname, 'data', 'reviews.csv');

const generateRooms = async (times) => {
  return new Promise(async (resolve, reject) => {
    let failed = false;
    let tenPercent = Math.floor(times / 10);
    const writeable = fs.createWriteStream(ROOMS_DIR);
    writeable.on('finish', () => {
      resolve();
    });
    writeable.on('error', (err) => {
      failed = true;
      console.log(err);
    });

    writeable.write(`id`);

    for(let i = 0; i < times; i++) {
      if (failed) {
        break;
      }

      if (i % tenPercent === 0) {
        console.log(`Rooms: Completed ${i} records.`);
      }

      let hasSpace = writeable.write(`\n${i}`);
      if (!hasSpace) {
        await new Promise((resolve, reject) => writeable.once('drain', resolve));
      }
    }

    console.log('Completed generating records for rooms table')
    writeable.end();
  });
  
};

const generateUsers = (times) => {
  return new Promise(async (resolve, reject) => {
    let failed = false;
    let tenPercent = Math.floor(times / 10);
    const writeable = fs.createWriteStream(USERS_DIR);
    writeable.on('finish', () => {
      resolve();
    });
    writeable.on('error', (err) => {
      failed = true;
      console.log(err);
    });

    writeable.write(`id,name,profilePicNum`);

    for(let i = 0; i < times; i++) {
      const userIndex = Math.floor(Math.random() * 1000);
      const { name, profilePicNum } = users[userIndex];
      let hasSpace = true;

      if (failed) {
        reject();
        break;
      }

      if (i > 0 && i % tenPercent === 0) {
        console.log(`Users: Completed ${i} records.`);
      }

      hasSpace = writeable.write(`\n${i},${name},${profilePicNum}`);

      if (!hasSpace) {
        await new Promise((resolve, reject) => writeable.once('drain', resolve));
      }
    }

    console.log('Completed generating records for users table')
    writeable.end();
  });
};

const generateReviews = (times) => {
  return new Promise(async (resolve,reject) => {
    let totalReviews = 0;
    let hasSpace = true;
    let failed = false;
    let tenPercent = Math.floor(times / 10);
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
    
    for(let i = 0; i < times; i++) {
      const reviewCount = Math.floor(Math.random() * 25);

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

      console.log(`Created ${totalReviews} total reviews.`);
    }

    console.log('Completed generating records for users table')
    writeable.end();
  });
};

const postgresGenerator = (times) => {
  return generateRooms(times)
    .then(() => generateUsers(times))
    .then(() => generateReviews(times))
    .then(() => console.log("Data Generation Complete"))
    .catch(() => console.log('Data Generation Failed'));
}

postgresGenerator(10000000);
