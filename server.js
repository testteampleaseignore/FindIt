
// Express - A Node.js Framework
var express = require('express');

// Body-Parser - A tool to help use parse the data in a post request
var bodyParser = require('body-parser');

// Pg-Promise - A database tool to help use connect to our PostgreSQL database
var pgp = require('pg-promise')();

// filesystem
var fs = require('fs');
 
var app = express();

// Support json encoded & url encoded bodies
app.use(bodyParser.json());              
app.use(bodyParser.urlencoded({ extended: true }));

// Read database configuration in from file
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var db = pgp(config);

// set the view engine to ejs
app.set('view engine', 'ejs');

 //This line is necessary for us to use relative paths and access our resources directory
app.use(express.static(__dirname + '/'));


// login page 
app.get('/', function(req, res) {
	//res.render('pages/login', {
	//	local_css: "signin.css", 
	//	my_title: "Login Page"
	//});
});

// registration page 
app.get('/register', function(req, res) {
	// res.render('pages/register',{
	// 	my_title:"Registration Page"
	//});
});

app.get('/upload-target', function(req, res) {
	
});

app.listen(3000);
console.log('3000 is the magic port');
