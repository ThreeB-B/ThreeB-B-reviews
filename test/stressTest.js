import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 30,
  duration: '600s'
}

const URL = `http://3bb-reviews-classic-1100595086.us-west-2.elb.amazonaws.com/reviews/`

export default function() {
  const highPopIndex = Math.ceil((Math.random() * 10))
  let id;

  if (highPopIndex < 9) {
    id = Math.floor(Math.random() * 2000000);
  } else {
    id = Math.floor((Math.random() * (10 - 2) + 2) * 1000000);
  }

  const REQ_URL = URL + 1000000;

  let res = http.get(REQ_URL);

  check(res, {
    'took less than 2s to complete': (r) => r.timings.duration < 2000,
    'no errors': (r) => !r.error,
    'error code is 200': (r) => r.status === 200
  });
};