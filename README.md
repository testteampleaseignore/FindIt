Where we store the code for FindIt!

### How to Use

You can execute `npm run watch` at the terminal, from this project directory, to automatically update the server when changes are made. 

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

