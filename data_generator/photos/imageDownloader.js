const fs = require('fs');
const axios = require('axios');
const path = require('path');

const PATH = path.join(__dirname);
const url = 'https://loremflickr.com/44/44/profile'

let padNum = (number, size) => {
  let result = "0000000" + number;
  return result.substr(-size);
}

let getImage = (fileName) => {
  let WRITE_PATH = path.join(PATH, "images", fileName + ".jpg");
  axios.get(url, {responseType: "stream"})
  .then((response) => {
    stream = response.data;
    return stream.pipe(fs.createWriteStream(WRITE_PATH));
  })
  .catch((err) => console.log(err))
};

let downloadImages = (times) => {
  
  let timer = 0;

  for (let counter = 0; counter < times; counter++) {
    let fileName = padNum(counter, 3);
    setTimeout(() => getImage(fileName), timer);
    timer += 2000;
  }
}

downloadImages(75);