Where we store the code for FindIt!

### Getting Setup

#### PostgreSQL stuff

- Enter a Postgres terminal and make a database called "findit_db". 
- Enter the database with "\c findit_db".
- Paste the contents of [db-create.sql](https://github.com/testteampleaseignore/FindIt/blob/master/db-create.sql) into your pgSQL terminal.
- If your postgres user's password is not "pwd", change https://github.com/testteampleaseignore/FindIt/blob/master/server.js#L24 to reflect what it actually is (or change your password, whichever you want).

#### NodeJS stuff

- Run `npm install` inside the project directory (after you clone it). This should install all requirements as stored in package.json
- You can execute `npm run watch` at the terminal, from this project directory, to both (1) serve / run the project, and  (2) automatically update the server when changes are made. This is just a handy way to develop the app without restarting the server over and over. 

### Proposed Tasks Remaining 

+ [x] Home page (blank)
+ [ ] Login Page
+ [ ] Register Page
+ [ ] Upload Target Page
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
+ target_url
+ target_lat
+ target_long
+ started_date
+ starter_id (users fk)

#### round_placements
+ place number
+ user id
+ round id

