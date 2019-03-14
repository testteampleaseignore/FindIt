
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS rounds;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,       /* Unique identifier for each player (it's possible multiple 
                                  players have the same name/similiar information) */
  user_name VARCHAR(50) NOT NULL,   /* The player's username */
  password VARCHAR(50),             /* Player's password */
  email VARCHAR(100),                /* Player's email */
  points INTEGER,
  attempts INTEGER
);

CREATE TABLE IF NOT EXISTS rounds (
    id SERIAL PRIMARY KEY, /* ID for the round to be able to refer to it */
    starter_id INTEGER REFERENCES users(id), /* User id of the user who started this round */
    datetime_started TIMESTAMP, /* A timestamp (including both date & time data) for when the 
                                   round was started, e.g. '2018-03-22 19:10:25' */ 
    target_url VARCHAR(510), /* The URL which points to the "target" image (the place users 
                                must try to find this round) */
    target_latitude DECIMAL, /* Target's latitude */
    target_longitude DECIMAL, /* Target's longitude */
);

