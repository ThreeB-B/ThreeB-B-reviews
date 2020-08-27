const fs = require('fs');
const { Readable } = require('stream');
const { roomReviewGenerator } = require('./roomReviewGenerator');

let failed = false;
const readable = new Readable;
const writeable = fs.createWriteStream('./bigDataSet.json');
readable.pipe(writeable)
  .on('error', (err) => {
    failed = true;
    console.log(err);
  })
writeable.on('error', (err) => {
  failed = true;
  console.log(err);
})

module.exports.bigDataGenerator = async (times) => {
  readable.push('{')
  for(let i = 0; i < times; i++) {
    if (failed) {
      break;
    }

    if (readable.isPaused()) {
      console.log('Stream paused');
      await new Promise((resolve, reject) => readable.on('resume', resolve));
    }

    if (i % 100000 === 0) {
      console.log(`Completed ${i} records.`);
    }
    readable.push(`\n"${i}":${JSON.stringify(roomReviewGenerator(i))},`);
  }

  readable.push('\n}');
  readable.push(null);
  console.log(`Generated ${times} records.`)
};

module.exports.bigDataGenerator(10000000);