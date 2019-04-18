#!/usr/bin/env node


// load stdlibs
const fs = require('fs');
const path = require('path');

// load external libs
const express = require('express');
const dotenv = require('dotenv');
const pgp = require('pg-promise')();
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcrypt');
const busboy = require('connect-busboy');
const filenamify = require('filenamify');
const uniqueFilename = require('unique-filename')


// load .env config file
dotenv.config();

// make an app
var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
//This line is necessary for us to use relative 
// paths and access our resources directory
app.use(express.static(__dirname + '/')); 
// Create a session and initialize
// a not-so-secret secret key
app.use(session({
	secret: process.env.SECRET || 'whisper', 
	saveUninitialized: true,
	resave: true,
	store: new pgSession({pgPromise: db})
}));
app.use(busboy({immediate: true }));

// get db & its configuration...
// support old use of db-config.json for now;
// TODO: get rid of db-config.json because we can just use .env
if(process.env.DATABASE_URL) {
    var db = pgp(process.env.DATABASE_URL);
} else {
    var dbConfig = JSON.parse(fs.readFileSync('db-config.json', 'utf8'));
    var db = pgp(dbConfig);
}

// One way we could handle score upload logic
var PLACEMENTS_TO_POINTS = {
	1: 10,
	2: 5,
	3: 3,
	4: 2,
	5: 1	
}

function isLoggedIn(req) {
	return (req.session && req.session.userID);
}

function ensureLoggedInOrRedirect(req, res) {
	// Check if the user is logged in or not
	if (isLoggedIn(req)) {	
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

function generateUniqueSecureFilename(filename) {
	let secureFilename = filenamify(filename, {replacement: '-'}); 
	let fileExt = path.extname(secureFilename);
	let secureFilenameNoExt = path.basename(secureFilename, fileExt);
	return uniqueFilename(
		'', secureFilenameNoExt) + fileExt.toLowerCase();
}

function roundHasLocalTarget(round) {
	if(round) {
		expectedPath = path.join(
			__dirname, 'uploads', round.target_url);
		return fs.existsSync(expectedPath);
	} else {
		return false;
	}
}


app.get('/', function(req, res) {
	res.redirect('/dashboard');
})

app.get('/login', function(req, res)
{
	// Should present the user with a /login form
	res.render('pages/login_form', {
		my_title: 'Login',
		loggedIn: isLoggedIn(req)
	});
});

app.post('/login', function(req, res)
{
	var form = {}; 
	req.busboy.on('field', function(key, value) {
		form[key] = value;
	});
	req.busboy.on('finish', function() {

		// Validate the user's submitted login form by
		// (1) Checking if the hash of the submitted password 
		//   matches the one we have stored in our database,
		// SQLQ uery to get user_name and password_hash from users table
		var check_login = "SELECT id, password_hash FROM users WHERE user_name='" + 
			form.username + "';"
		db.oneOrNone(check_login)
			.then(function(result) {
				// (2) On success, redirect to the homepage
				if(result) {
					if(bcrypt.compareSync(form.password, result.password_hash)) {
					 // Passwords match
					 console.log(`User logged in: ${result.id}`);
					 req.session.userID = result.id;
					 req.session.save(function(err) {
					 	res.redirect('/dashboard');
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
});


app.get('/logout', function(req, res)
{
	req.session.userID = null;
	req.session.save(function(err) {
		res.redirect('/dashboard');
	});
});

app.get('/register', function(req, res)
{
	res.render('pages/registrationPage', {
		my_title: 'Register',
		error: req.query.error,
		loggedIn: isLoggedIn(req)
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
			  res.redirect('/dashboard');
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

app.get('/profile', function (req, res) {
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

app.post('/uploadTarget', function(req, res) {

	loggedIn = ensureLoggedInOrRedirect(req, res);
	if (loggedIn) {

		var form = {}
		req.busboy.on('field', function(key, value) {
			form[key] = value;
		});
		req.busboy.on('file', function(fieldname, file, filename) {

			// save the file to the filesystem
			console.log(`Received file: ${filename}`);
			form['filename'] = generateUniqueSecureFilename(filename);
			let filepath = path.join(__dirname, 'uploads', form['filename'])
			console.log(`Saving the received file at: ${filepath}`);
	        let fstream = fs.createWriteStream(filepath);
	        file.pipe(fstream);
	        fstream.on('close', function () {
	            console.log('File saved.');
	        });

	        
		});
		req.busboy.on('finish', function() {
			// construct a SQL query to insert a round / target
            var date = new Date().toISOString()
         			.replace(/T/, ' ').replace(/\..+/, '');
		    var insert_round = 'INSERT INTO rounds ' +
		    '(starter_id, datetime_started, target_url, ' + 
		    'target_latitude, target_longitude) ' +
		    `values (${req.session.userID}, '${date}', ` +
		    `'${form['filename']}', ${form['lat']}, ${form['lat']});`;	 

		    // run the query!   
		    db.oneOrNone(insert_round)
			  .then(function(result) {
			  	res.redirect('/dashboard');
			  })
			  .catch((result) => {
			  	console.log(`sql: ${insert_round}`);
			  	console.log(`result: ${result}`);
		        res.redirect('/dashboard');
			  });
		});
	}
})

app.get('/rounds/:roundId', function(req, res) {
	
	console.log('wwwwwwwww')
	var loggedIn = ensureLoggedInOrRedirect(req, res);
	if(loggedIn) {
		console.log('hello');
		var round_stmt =  "SELECT target_url, target_latitude, target_longitude, id FROM rounds WHERE id=" + req.params.roundId + ';';
		var user_name = 'SELECT user_name FROM users WHERE id=' + req.session.userID + ';';
		db.task('get-everything', task => {
	    	return task.batch([
	            task.oneOrNone(round_stmt),
	            task.one(user_name)
	        ]);
		})
		.then(results => {
	      let round = results[0];
	      let user = results[1];

	      console.log('hello')
	      if(round && user && roundHasLocalTarget(round)) {
	      	console.log('what?')
	      	res.render('pages/round', {
		      	my_title: "Round #" + req.params.roundId,
		        round: round,
		        name: user.user_name,
		        loggedIn: true,
                keys: {
				    googlemaps: process.env.GOOGLE_MAPS_API_KEY,
				    pn_sub: process.env.PN_SUB_KEY, 
				    pn_pub: process.env.PN_PUB_KEY
                }
	      	})
	      } else {
	      	console.log('No such user, round, or invalid round');
	      	console.log(results);
	      	res.redirect('/dashboard');
	      }
		})
		.catch(function(error) {
		 	console.log(error);	  	
		 	res.redirect('/dashboard');
		});	
	}	
});

app.get('/dashboard', function(req, res) {
	var target_url = "SELECT target_url, id FROM rounds ORDER BY id DESC;";
	var loggedIn = isLoggedIn(req);
	db.any(target_url)
		.then(function(results){

			// Don't display rounds for which the targets are "stale",
			// i.e. their file does not exist in the filesystem 
			results = results.filter(roundHasLocalTarget);

			// Pad out the dashboard with some "fake" 
			// rounds to make it look slightly nicer
			if(results.length > 0) {
				while(results.length < 8) {
					results.push({fake: true});
				}
			}
			res.render('pages/dashboard', {
				my_title: 'FindIt!',
				loggedIn: loggedIn,
				roundsets: groupBySetsOfN(results, 4)
			});
		})
		.catch(function(error){
			console.log(error);
			res.render('pages/dashboard', {
				my_title: 'FindIt!',
				loggedIn: loggedIn,
				roundsets: []
			});
		});
});


app.listen(process.env.PORT);
console.log(`${process.env.PORT} is the magic port`);

