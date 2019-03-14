Where we store our code!

### Database Schema

#### user
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
+ time_started
+ target_id
+ starter_id (user fk)

#### round_placements
+ place_number
+ user_id
+ round_id

#### reports_offensive
+ target_id
+ player_id
+ date

