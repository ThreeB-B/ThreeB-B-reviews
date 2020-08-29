const fs = require('fs');
const path = require('path');
const { roomReviewGenerator } = require('./roomReviewGenerator');

const WRITE_PATH = path.resolve(__dirname, "data");



module.exports.bigDataGenerator = async (times) => {
  let failed = false;
  let hasSpace = true;
  const writeable = fs.createWriteStream(`${WRITE_PATH}/arangoData.json`);
  writeable.on('error', (err) => {
    failed = true;
    console.log(err);
  });
  
  writeable.write('[')
  for(let i = 0; i < times; i++) {
    if (failed) {
      break;
    }

    if (i % 100000 === 0) {
      console.log(`Completed ${i} records.`);
    }

    if (i === times - 1) {
      hasSpace = writeable.write(`\n${JSON.stringify(roomReviewGenerator(i))}`);
    } else {
      hasSpace = writeable.write(`\n${JSON.stringify(roomReviewGenerator(i))},`);
    }
    if (!hasSpace) {
      await new Promise((resolve, reject) => writeable.once('drain', resolve));
    }
  }

  writeable.write('\n]');
  writeable.end();
  console.log(`Generated ${times} records.`)
};

module.exports.bigDataGenerator(10000000);