const express = require('express');
const morgan = require('morgan');
const redis = require('redis');
const { promisify } = require('util');
const { getReviews } = require('./controllers/getReviews');
require('newrelic');

const app = express();
const PORT = 3004;

const cacheDb = redis.createClient();

const redisGet = promisify(cacheDb.get).bind(cacheDb);
const redisSet = promisify(cacheDb.setex).bind(cacheDb);

const cache = async (req, res, next) => {
  const reqPath = req.originalUrl;
  const body = await redisGet(reqPath)

  if (body) {
    res.send(body);
    return;
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      redisSet(reqPath, 60, JSON.stringify(body))
        .catch((err) => {
          console.log(err);
        });
      res.sendResponse(body);
    }
    next();
  }
}

app.use('/:id', express.static(`${__dirname}/../client/dist`));
// app.use(morgan('dev'));

app.get('/reviews/:room_id', async (req, res) => {
  const { room_id } = req.params;

  try {
    const reviews = await getReviews(room_id);
    res.send(reviews);
  } catch (err) {
    console.log(`FAIL: ${err}`);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log("Server is now listening on port:", PORT);
  console.log(`Visit service at http://localhost:${PORT}/:id`);
});