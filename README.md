Where we store the code for FindIt!

### Getting Setup

#### PostgreSQL stuff

- Enter a Postgres terminal and, if you don't already have a database, make one called "findit". If your named yours differently, that's OK. 
- Enter the database with "\c findit" (or whatever you called it).
- Paste the contents of [db-create.sql](https://github.com/testteampleaseignore/FindIt/blob/master/db-create.sql) into your pgSQL terminal.
- Copy db-config.json.example to db-config.json, e.g. `db-config.json{.example,}`.
- Modify your new db-config.json file to match your PostgreSQL credentials: password, user, etc.

#### NodeJS stuff

- Run `npm install` inside the project directory (after you clone it). This should install all requirements as stored in package.json
- You can execute `npm run watch` at the terminal, from this project directory, to both (1) serve / run the project, and  (2) automatically update the server when changes are made. This is just a handy way to develop the app without restarting the server over and over. 

### Proposed Tasks Remaining 

+ [x] Home page (blank)
+ [x] Login Page
+ [x] Register Page
+ [x] Upload Target Page
+ [ ] Uploaded target persists
+ [ ] "I'm here!" Button
+ [ ] Score update / placing logic
+ [ ] Current Round Display (on Home page)
+ [ ] Player stats Profile
+ [ ] Transition to new round logic
+ [ ] Reporting a picture

### Proposed Database Schema

#### users
+ id 
+ email
+ password
+ points
+ attempts

#### rounds
+ id
+ target_url
+ target_lat
+ target_long
+ started_date
+ starter_id (users fk)

#### round_placements
+ place number
+ user_id
+ round_id

An example usage of this database design would be:

    SELECT COUNT(*) as times_placed_first FROM users 
    JOIN round_placements ON users.id=round_placements.user_id 
    WHERE placement_number=1 AND user_name='nick';`

If the round_placements table looked like this...

     placement_number | user_id | round_id 
    ------------------+---------+----------
                    1 |       2 |        1
                    1 |       1 |        2
                    1 |       2 |        3

.. and "nick" was the 2nd user, the result would be:

    times_placed_first 
    --------------------
                  2
