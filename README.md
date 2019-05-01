Where we store the code for FindIt!

### Getting Setup

#### PostgreSQL stuff

- Enter a Postgres terminal and, if you don't already have a database, make one called "findit". If your named yours differently, that's OK. 
- Enter the database with `\c findit` (or whatever you called it).
- Paste the contents of [db-create.sql](https://github.com/testteampleaseignore/FindIt/blob/master/db-create.sql) into your pgSQL terminal.

#### Code to create the database is provided in the file db-create.sql

#### NodeJS stuff

- Run `npm install` inside the project directory (after you clone it). This should install all requirements as stored in package.json
- You can execute `npm run watch` at the terminal, from this project directory, to both (1) serve / run the project, and  (2) automatically update the server when changes are made. This is just a handy way to develop the app without restarting the server over and over. 

#### How to run the app locally
- Run 'node server.js' inside the project directory.
- The url for the website is 'http://localhost:3000/'

#### How to test the code
- Run 'npx cypress open' in your project directory.
- Then choose the test case you wish to run.

#### General

Initialize an environment variable config:

    cp .env{.example,}

After you've done that, edit the file you created (.env), changing 
database credentials as specified by DATABASE_URL if necessary.

### Proposed Tasks Remaining 

+ [x] Home page (blank)
+ [x] Login Page
+ [x] Register Page
+ [x] Upload Target Page
+ [x] Target / Location persistence
+ [x] Checking a target location
+ [x] Make round placement-to-score logic
+ [x] Current Round Display (on Home page)
+ [x] Player stats Profile
+ [x] Transition to new round logic
+ [x] Reporting a picture

### Proposed Database Schema

#### users
+ id 
+ user_name
+ email
+ password
+ points

#### rounds
+ id
+ target_url
+ target_lat
+ target_long
+ started_date
+ starter_id (users fk)

#### round_attempts
+ user_id
+ round_id

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
		  
To get some testing data right away to start hacking,
run `psql -U <username> <dbname> < testing-db.sql`,
taking care to replace username and dbname appropriately.

## Project Structure

#### Page Templates
- All of the page templates are located in the views/pages folder. 
- Embedded javascript and w3schools was used to design these pages.
- The style for the pages was done in .css files. These can be viewed in the folder resources/css.

#### The partials folder
- Contains reused code.
    - The header, the footer, and the menu were used for multiple pages.

#### Server.js
- All of the get and post requests are done in server.js.
- The login information is also encrypted in this file.

#### Resources
- Along with CSS already mentioned in this folder, we also have additional JavaScript files, & favicon images. There are some more javascript utilities in messages.js and utils.js.

#### Uploads Folder
- This contains a .keep file that ensures that files are uploaded and kept during a game.

#### Tests
- These are all found under cypress/integration
- These tests test the production application as we have currently configured things, which is not ideal because stateful features can't really be tested properly; ideally, we would test with our development server on localhost. 



