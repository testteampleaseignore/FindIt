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
var bcrypt = require('bcrypt');

// TODO: read this from db-config.json
// e.g. something like: var dbConfig = JSON.parse(fs.readFileSync('file', 'utf8'));
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
app.use(express.static(__dirname + '/')); //This line is necessary for us to use relative paths and access our resources directory

// Create a session and initialize
// a not-so-secret secret key
app.use(session({
	'secret': 'whisper'
}));

app.get('/',function(req,res)
{
   // Check if the user is logged in or not
	if (req.session.userID) 
	{
		db.one('SELECT user_name FROM users WHERE id=$1', [req.session.userID])
		  .then(function(result) {
		  	console.log(`User logged in: ${result.user_name}`);
		  	res.render('pages/home', {
				my_title: "Home Page",
				username: result.user_name
			});
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
	//TODO: make a nice page
	// Should present the user with a /login form
	res.render('pages/login_form', {
		my_title: 'Login'
	});
});

app.post('/login', function(req, res)
{
	var body = req.body;
	//TODO
	// Validate the user's submitted login form by
	// (1) Checking if the hash of the submitted password 
	//   matches the one we have stored in our database,
	// SQLQ uery to get user_name and password_hash from users table
	var check_login =" SELECT id, password_hash FROM users WHERE user_name='"+ body.username+"';"
	db.oneOrNone(check_login)
		.then(function(result) {
			// (2) On success, redirect to the homepage
			if(result) {
				if(bcrypt.compareSync(body.password, result.password_hash)) {
				 // Passwords match
				 req.session.userID = result.id;
				 res.redirect('/'); 
				} else {
				 // (3) On different failures, return the user to the 
				 // login page and display a new error message explaining 
				 // what happened
				 // Passwords don't match
				 res.redirect('/login'); 
				}
			} else {
				// Username was not found
				res.redirect('/login');
			}
		})
		.catch(function(result) {
		    console.log(result);
	  	});	

});


app.get('/logout', function(req, res)
{
	req.session.userID = null;
	res.redirect('/login');
});

app.get('/register', function(req, res)
{
	res.render('pages/registrationPage', {
		error: req.query.error
	});
});

app.post('/register', function(req, res)
{
	var body = req.body;
	var password_hash = bcrypt.hashSync(body.password, 10);
	// console.log(body);
	var insert_user = 'INSERT INTO users (user_name, email, password_hash) ' +
	                      `VALUES ('${body.username}', '${body.email}', '${password_hash}') ` +
	                      'RETURNING id;' 
	// console.log(insert_username);
	db.oneOrNone(insert_user)
	  .then(function(result) {
	  	if(result) { 
      	  // Log the successfully registered user in; NOT working yet
      	  req.session.userID = result.id;
		  // If everything looks good, send the now-logged-in user to the home page
		  res.redirect('/');
	  	}
	  })
	  .catch((result) => {
	    console.log(result.message);
	    if(result.message.startsWith('duplicate')) {
	    	var message = 'User already exists! Try again.';
	    	var urlEncodedMessage = encodeURIComponent(message);
	    	res.redirect(`/register?error=${urlEncodedMessage}`);
	    }
	  })
});



app.listen(3000);
console.log('3000 is the magic port');
