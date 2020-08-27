const casual = require('casual');

const sentenceGenerator = (times) => {
  const sentences = [];

  for (let i = 0; i < times; i++) {
    sentences.push(casual.text);
  }

  return sentences;
};

module.exports.sentences = sentenceGenerator(1000);