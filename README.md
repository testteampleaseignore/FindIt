Where we store our code!

### Proposed Database Schema

#### users
+ id 
+ email
+ password
+ points
+ attempts

#### targets
+ target_url
+ target_lat
+ target_long
+ started_date
+ starter_id (users fk)

#### round_placements
+ place number
+ user id
+ round id
