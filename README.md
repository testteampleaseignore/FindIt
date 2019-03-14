Where we store our code!

### Database Schema

#### users
+ id 
+ email
+ username
+ password
+ points
+ attempts

#### targets
+ url
+ lat
+ long
  
#### rounds
+ started_date
+ ended_date
+ target_id
+ starter_id (users fk)

#### round_placements
+ place number
+ user id
+ round id

#### reports_offensive
+ target_id
+ player_id
+ date
