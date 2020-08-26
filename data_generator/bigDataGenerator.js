const fs = require('fs');
const { roomReviewGenerator } = require('./roomReviewGenerator');

const file = fs.createWriteStream('./bigDataSet.json');

module.exports.bigDataGenerator = (times) => {
  file.on('error', (err) => {
    console.log(err);
  });

  file.write('{');

  for(let i = 0; i < times; i++) {
    file.write(`\n"${i}":${JSON.stringify(roomReviewGenerator(i))},`);
  }

  file.write('\n}');
  file.end();
};

module.exports.bigDataGenerator(10000000);