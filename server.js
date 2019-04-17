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
var fs = require('fs');

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

// get db & its configuration...
// support old use of db-config.json for now;
// TODO: get rid of db-config.json because we can just use .env
if(process.env.DATABASE_URL) {
    var db = pgp(process.env.DATABASE_URL);
} else {
    var dbConfig = JSON.parse(fs.readFileSync('db-config.json', 'utf8'));
    var db = pgp(dbConfig);
}

// set the view engine to ejs
app.set('view engine', 'ejs');
//This line is necessary for us to use relative 
// paths and access our resources directory
app.use(express.static(__dirname + '/')); 

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

const loggedInHome =  '/dashboard';
const loggedOutHome = '/';

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

function groupBySetsOfN(items, n) {
	/* Take an array like this: [1, 2, 3, 4, 5, 6, 7],
	   and return [[1, 2, 3], [4, 5, 6], [7]] */
	let groups = [];
	let currentGroup;
	items.forEach(function(item, i) {
		if (i % n === 0) {
			currentGroup = [];
		}
		currentGroup.push(item);
		if (i % n-1 === 2 || i === items.length-1) {
			groups.push(currentGroup);
		}

	});
	return groups;
}


app.get('/',function(req,res)
{	
	// If already logged in, redirect to current round page,
	// which has all features of this page but more
	if (req.session.userID) {
		res.redirect(loggedInHome);
	} else {

		var target_stmt =  "SELECT target_url FROM rounds ORDER BY id DESC limit 1;"

		db.oneOrNone(target_stmt)
		  .then(function(round){
			res.render('pages/home', {
				target_url: round ? round.target_url : null,
				my_title: "FindIt!",
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
				 	res.redirect(loggedInHome);
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
		res.redirect(loggedOutHome);
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
			  res.redirect(loggedInHome);
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
		var query = 'SELECT user_name, points, ROW_NUMBER() OVER(ORDER BY points DESC)'+
		' FROM users WHERE id='+ req.session.userID +';';
		//var query1 = 'SELECT points FROM users WHERE id='+ req.session.userID +';';
		db.any(query)
		/*db.task('get-everything', task => {
	    	return task.batch([
	            task.one(query),
	            task.one(query1)
	        ]);
		})*/
		.then(function(user_info)
		{
			res.render('pages/playerProfilePage', {
				my_title: 'Player Profile',
				loggedIn: true,
				data: user_info
			});
		})
		.catch(function(results)
		{
			console.log('You messed up');
		});
	}
});

app.get('/leaderboard', function(req, res) {
	var loggedin = ensureLoggedInOrRedirect(req, res);
	if(loggedin) {
		var query = 'SELECT user_name, points, ROW_NUMBER() OVER(ORDER BY points DESC)'+
		' FROM users';
		db.any(query)
		.then(function(user_info)
		{
			res.render('pages/Leaderboard', {
				my_title: 'Leaderboard',
				loggedIn: true,
				data: user_info
			});
		})
		.catch(function(results)
		{
			console.log('You messed up');
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
		  	res.redirect(loggedInHome);
		  })
		  .catch((result) => {
		  	console.log(result);
		    console.log(result.message);
	        res.redirect('/upload');
		  });
	}
})

app.get('/rounds/:roundId', function(req, res) {
	
	var loggedIn = ensureLoggedInOrRedirect(req, res);
	console.log(loggedIn);
	if(loggedIn) {
		var target_url =  "SELECT target_url, id FROM rounds WHERE id=" + req.params.roundId + ';';
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

	      if(round && user) {
	      	res.render('pages/round', {
		      	my_title: "Round #" + req.params.roundId,
		        round: round,
		        name: user,
		        loggedIn: true
	      	})
	      } else {
	      	console.log('No such round or user');
	      	console.log(results);
	      	res.redirect(loggedInHome);
	      }
		})
		.catch(function(error) {
		 	console.log(error);	  	
		 	res.redirect(loggedInHome);
		});	
}	
});

app.get('/dashboard', function(req, res) {
	var loggedin = ensureLoggedInOrRedirect(req, res);
	if(loggedin) {
		var target_url =  "SELECT target_url, id FROM rounds ORDER BY id DESC;";
		db.any(target_url)
			.then(function(results){
				// Pad out the dashboard with some "fake" 
				// rounds to make it look slightly nicer
				while(results.length < 8) {
					results.push({fake: true});
				}
				res.render('pages/dashboard', {
					my_title: 'Dashboard',
					loggedIn: true,
					roundsets: groupBySetsOfN(results, 4)
				});
			})
			.catch(function(results){
				res.render('pages/dashboard', {
					my_title: 'Dashboard',
					loggedIn: true,
					roundsets: null
				});
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

