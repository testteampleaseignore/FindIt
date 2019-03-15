/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Create Database Connection
var pgp = require('pg-promise')();
var session = require('express-session');


const dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'findit_db',
	user: 'postgres',
	password: 'pwd'
};

var db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

// Create a session and initialize
// a not-so-secret secret key
app.use(session({
	'secret': 'whisper'
}
));

app.get('/',function(req,res)
{
   // Check if the user is logged in or not
	if (req.session.userID) 
	{
		res.render('pages/home', {
			my_title: "Home Page"
		});
	}
	else 
  {
      // If not, make them login
		res.redirect('/login');
	}
	
});

app.get('/login', function(req, res)
{
	//TODO
	// Should present the user with a /login form
});

app.post('/login', function(req, res)
{
	//TODO
	// Validate the user's submitted login form by
	// (1) Checking if the hash of their submitted password 
	//   matches the one we have stored in our database,
	// (2) On success, redirect to the homepage
	// (3) On failure, return the login page and display
	//   an error message explaining what happened
});

app.get('/register', function(req, res)
{
	res.render('pages/registrationPage');
});

app.post('/register', function(req, res)
{
	var body = req.body;
	var insert_username = 'INSERT INTO users (username, email, password) ' +
	                      `VALUES (${body.username}, ${body.email}, ${body.password}); `
	db.any(insert_username)
	.then(function(result) {
		console.log(result); 
	      	// Log the successfully registered user in; NOT working yet
	      	// req.session.userID = result[0].id;
		// If everything looks good, send the logged in user to the home page
		// res.redirect('/');
	});
});



app.listen(3000);
console.log('3000 is the magic port');
