#!/usr/bin/env node

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
const multer = require('multer'); //multer

// Setup uploads
var storage = multer.diskStorage({
  destination: 'uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpeg')
  }
});

var upload = multer({ storage: storage })

// load .env config file
const dotenv = require('dotenv');
dotenv.config();

//Create Database Connection
var pgp = require('pg-promise')();
var session = require('express-session');
var pgSession = require('connect-pg-simple')(session);

var bcrypt = require('bcrypt');

// get db & its configuration
var db = pgp(process.env.DATABASE_URL);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/')); //This line is necessary for us to use relative paths and access our resources directory

// Create a session and initialize
// a not-so-secret secret key
app.use(session({
	secret: 'whisper', 
	saveUninitialized: true,
	resave: true,
	store: new pgSession({pgPromise: db})
}));

// One way we could handle score upload logic
var PLACEMENTS_TO_POINTS = {
	1: 10,
	2: 5,
	3: 3,
	4: 2,
	5: 1	
}

function ensureLoggedInOrRedirect(req, res) {
	// Check if the user is logged in or not
	if (req.session && req.session.userID) {	
		return true;
	} else {
        // If not, make them login
		res.redirect('/login');
		return false;
    }
}

app.get('/',function(req,res)
{	
	// If already logged in, redirect to current round page,
	// which has all features of this page but more
	if (req.session.userID) {
		res.redirect('/currentRound');
	} else {

		var target_stmt =  "SELECT target_url FROM rounds ORDER BY id DESC limit 1;"

		db.oneOrNone(target_stmt)
		  .then(function(round){
			res.render('pages/home', {
				target_url: round ? round.target_url : null,
				my_title: "Home",
				loggedIn: false
			})
		})
		.catch(function(error) {
			console.log(error);
	  	});	
	}

});

app.get('/login', function(req, res)
{
	// Should present the user with a /login form
	res.render('pages/login_form', {
		my_title: 'Login',
		loggedIn: req.session.userID == false
	});
});

app.post('/login', function(req, res)
{
	var body = req.body;

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
				 console.log(`User logged in: ${result.id}`);
				 req.session.userID = result.id;
				 req.session.save(function(err) {
				 	res.redirect('/currentRound');
				 }); 
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
	req.session.save(function(err) {
		res.redirect('/');
	});
});

app.get('/register', function(req, res)
{
	res.render('pages/registrationPage', {
		my_title: 'Register',
		error: req.query.error,
		loggedIn: req.session.userID == false
	});
});

app.post('/register', function(req, res)
{
	var body = req.body;
	var password_hash = bcrypt.hashSync(body.password, 10);
	var insert_user = 'INSERT INTO users (user_name, email, password_hash) ' +
	                      `VALUES ('${body.username}', '${body.email}', '${password_hash}') ` +
	                      'RETURNING id;' 
	db.oneOrNone(insert_user)
	  .then(function(result) {
	  	if(result) { 
      	  // Log the successfully registered user in; NOT working yet
      	  req.session.userID = result.id;
      	  req.session.save(function(err) {
			  // If everything looks good, send the now-logged-in user to the home page
			  res.redirect('/currentRound');
      	  });
	  	}
	  })
	  .catch((result) => {
	  	console.log(result);
	    console.log(result.message);
	    if(result.message.startsWith('duplicate')) {
	    	var message = 'User already exists! Try again.';
	    	var urlEncodedMessage = encodeURIComponent(message);
	    	res.redirect(`/register?error=${urlEncodedMessage}`);
	    }
	  })
});

app.get('/profile', function(req, res) {
	var loggedin = ensureLoggedInOrRedirect(req, res);
	if(loggedin) {
		res.render('pages/playerProfilePage', {
			my_title: 'Player Profile',
			loggedIn: true
		});
	}
});

app.get('/leaderboard', function(req, res) {
	var loggedin = ensureLoggedInOrRedirect(req, res);
	if(loggedin) {
		res.render('pages/Leaderboard', {
			my_title: 'Leaderboard',
			loggedIn: true
		});
	}
});

app.get('/startRound', function(req, res) {
	var loggedin = ensureLoggedInOrRedirect(req, res);
	if(loggedin) {
		res.render('pages/startRound', {
			my_title: 'Start Round',
			loggedIn: true,
            keys: {
			googlemaps: process.env.GOOGLE_MAPS_API_KEY,
			pn_sub: process.env.PN_SUB_KEY, 
			pn_pub: process.env.PN_PUB_KEY
		}
		});
	}
});

app.post('/uploadTarget', upload.single('myFile'), function(req, res, next) {

	loggedIn = ensureLoggedInOrRedirect(req, res);
	if (loggedIn) {
		const file = req.file
	  	if (!file) {
	    	const error = new Error('Please upload a file')
	    	error.httpStatusCode = 400
	    	return next(error)
	  	}
	    var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	    var insert_round = 'INSERT INTO rounds ' +
	    '(starter_id, datetime_started, target_url) ' +
	    `values (${req.session.userID}, '${date}', '${req.file.filename}')`;
	    
	    db.oneOrNone(insert_round)
		  .then(function(result) {
		  	res.redirect('/currentRound');
		  })
		  .catch((result) => {
		  	console.log(result);
		    console.log(result.message);
	        res.redirect('/upload');
		  });
	}
})

app.get('/currentRound', function(req, res) {
	
	var loggedin = ensureLoggedInOrRedirect(req, res);
	if(loggedin) {
		var target_url =  "SELECT target_url FROM rounds ORDER BY id DESC limit 1;"
		var user_name = 'SELECT user_name FROM users WHERE id=' + req.session.userID + ';';
		db.task('get-everything', task => {
	    	return task.batch([
	            task.oneOrNone(target_url),
	            task.one(user_name)
	        ]);
		})
		.then(results => {
	      let round = results[0];
	      let user = results[1];

	      res.render('pages/currentRound',{
	      	my_title: "Current Round",
	        round: round ? round : null,
	        name: user,
	        loggedIn: true
	      })
		})
		.catch(function(error) {
		 	console.log(error);	  	
		});	
}	
});

// TODO: Get rid of this route when it's appropriate
app.get('/whereami', function(req, res) {
	res.render('pages/whereami', {
		my_title: 'Where Am I?',
		loggedIn: false,
		keys: {
			googlemaps: process.env.GOOGLE_MAPS_API_KEY,
			pn_sub: process.env.PN_SUB_KEY, 
			pn_pub: process.env.PN_PUB_KEY
		}
	});
});

app.listen(process.env.PORT);
console.log(`${process.env.PORT} is the magic port`);

