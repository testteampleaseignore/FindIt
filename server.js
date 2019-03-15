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

app.use(session({
	'secret': 'whisper'
}
));

app.get('/',function(req,res)
{
	if (req.session.userID) 
	{
		res.render('pages/home', {
			my_title: "Home Page"
		});
	}
	else
	{
		res.redirect('/login');
	}
	
});

app.get('/login', function(req, res)
{
	//TODO
})

app.get('/register', function(req, res)
{
	res.render('pages/registrationPage');
})

app.post('/register', function(req, res)
{
	var body = req.body;
	var insert_username = 'INSERT INTO users (username, email, password) ' +
	                      `VALUES (${body.username}, ${body.email}, ${body.password}); `
	db.any(insert_username)
	.then(function(result) {
		console.log(result);
	})
})



app.listen(3000);
console.log('3000 is the magic port');