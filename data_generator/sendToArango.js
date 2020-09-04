const { Database } = require('arangojs');
const { username, password } = require('../database/config.js');
const path = require ('path');
const fs = require('fs');
const { Transform } = require('stream');

const db = new Database({
  url: "http://localhost:8529",
  database: "reviews",
  auth: { username: "root", password: "" }
});
const reviewsCollection = db.collection("reviews");

const READ_FROM = path.resolve(__dirname, "data", "arangoTest.json");
const read = fs.createReadStream(READ_FROM);

const sendToArango = new Transform({
  async transform (chunk, encoding, callback) {
    // console.log(`Transforming: ${chunk.toString()}`);
    let data = chunk.toString();
    data = `[${data}]`;
    console.log(`Importing: ${data}`);

    await reviewsCollection.import(JSON.stringify(chunk))
      .then(() => {
        console.log("Import fired");
      })
      .catch((err) => {
        console.log(`FAIL: ${err}`);
      })
    callback();
  }
});

read.pipe(sendToArango);
read.on('finish', () => {
  console.log("Import successful");
});
read.on('error', (err) => {
  console.log(`FAIL: ${err}`)
});