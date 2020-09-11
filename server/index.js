const express = require('express');
const morgan = require('morgan');
const { getReviews } = require('./controllers/getReviews');
const fs = require('fs');
require('newrelic');

const app = express();
const PORT = 3004;

app.use('/rooms/:id', express.static(`${__dirname}/../client/dist`));

app.get('/reviews/:room_id', async (req, res) => {
  let { room_id } = req.params;

  console.log(`room_id: ${room_id}`)

  if (typeof room_id !== "string") {
    room_id = Math.floor(Math.random() * 10000000);
  }

  try {
    const reviews = await getReviews(room_id);
    res.send(reviews);
  } catch (err) {
    console.log(`FAIL: ${err}`);
    res.sendStatus(500);
  }
});

app.get('/loaderio*', async (req, res) => {
  fs.readFile(`${__dirname}/../loaderio.txt`, (err, result) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.send(result);
    }
  });
});

app.listen(PORT, () => {
  console.log("Server is now listening on port:", PORT);
  console.log(`Visit service at http://localhost:${PORT}/:id`);
});
