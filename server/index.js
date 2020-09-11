const express = require('express');
require('newrelic');
const morgan = require('morgan');
const { getReviews } = require('./controllers/getReviews');

const app = express();
const PORT = 3004;

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
  console.log(`Visit service at http://localhost:${PORT}/:id=1`);
});