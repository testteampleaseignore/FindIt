
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS round_attempts;
DROP TABLE IF EXISTS round_placements;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,       /* Unique identifier for each player (it's possible multiple 
                                  players have the same name/similiar information) */
  user_name VARCHAR(50) UNIQUE NOT NULL,   /* The player's username */
  password_hash VARCHAR(510),             /* Hashed version of player's password */
  email VARCHAR(100),                /* Player's email */
  points INTEGER,
  attempts INTEGER,
  CONSTRAINT uq_user_info UNIQUE (user_name, email)
);

CREATE TABLE IF NOT EXISTS rounds (
    id SERIAL PRIMARY KEY, /* ID for the round to be able to refer to it */
    starter_id INTEGER REFERENCES users(id), /* User id of the user who started this round */
    datetime_started TIMESTAMP, /* A timestamp (including both date & time data) for when the 
                                   round was started, e.g. '2018-03-22 19:10:25' */ 
    target_url VARCHAR(510), /* The URL which points to the "target" image (the place users 
                                must try to find this round) */
    target_latitude DECIMAL, /* Target's latitude */
    target_longitude DECIMAL /* Target's longitude */
);

CREATE TABLE IF NOT EXISTS round_attempts (
    round_id INTEGER REFERENCES rounds(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (round_id, user_id)
);

CREATE TABLE IF NOT EXISTS round_placements (
    placement_number INTEGER,
    round_id INTEGER REFERENCES rounds(id),
    user_id INTEGER REFERENCES users(id),
    PRIMARY KEY (round_id, placement_number)
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

