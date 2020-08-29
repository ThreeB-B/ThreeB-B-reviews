CREATE TABLE reviews (
  id integer NOT NULL,
  date text NOT NULL,
  sentence text NOT NULL,
  accuracy_rating integer NOT NULL,
  communication_rating integer NOT NULL,
  cleanliness_rating integer NOT NULL,
  location_rating integer NOT NULL,
  check_in_rating integer NOT NULL,
  value_rating integer NOT NULL,
  overall_rating integer NOT NULL,
  user_id integer NOT NULL,
  room_id integer NOT NULL
);

CREATE TABLE rooms (
  id integer NOT NULL
);

CREATE TABLE users (
  id integer NOT NULL,
  name text NOT NULL,
  profilePicNum integer NOT NULL
);