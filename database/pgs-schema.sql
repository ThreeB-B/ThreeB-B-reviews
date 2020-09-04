CREATE TABLE reviews (
  id NUMERIC NOT NULL,
  room_id NUMERIC NOT NULL,
  user_id NUMERIC NOT NULL,
  accuracy_rating SMALLINT NOT NULL,
  communication_rating SMALLINT NOT NULL,
  cleanliness_rating SMALLINT NOT NULL,
  location_rating SMALLINT NOT NULL,
  check_in_rating SMALLINT NOT NULL,
  value_rating SMALLINT NOT NULL,
  overall_rating SMALLINT NOT NULL,
  date TEXT NOT NULL,
  sentence TEXT NOT NULL
);

CREATE TABLE rooms (
  id NUMERIC NOT NULL
);

CREATE TABLE users (
  id NUMERIC NOT NULL,
  name TEXT NOT NULL,
  profilePicNum NUMERIC NOT NULL
);