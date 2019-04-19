
const fs = require('fs');
const path = require('path');
const filenamify = require('filenamify');
const uniqueFilename = require('unique-filename');

module.exports = {

	isLoggedIn: function(req) {
		return (req.session && req.session.userID);
	},
	ensureLoggedInOrRedirect: function(req, res) {
		// Check if the user is logged in or not
		if (this.isLoggedIn(req)) {	
			return true;
		} else {
	        // If not, make them login
			res.redirect('/login');
			return false;
	    }
	},
	groupBySetsOfN: function(items, n) {
		/* Take an array like this: [1, 2, 3, 4, 5, 6, 7],
		   and, say, n=3; return [[1, 2, 3], [4, 5, 6], [7]] */
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
	},
	generateUniqueSecureFilename: function(filename) {
		let secureFilename = filenamify(filename, {replacement: '-'}); 
		let fileExt = path.extname(secureFilename);
		let secureFilenameNoExt = path.basename(secureFilename, fileExt);
		return uniqueFilename(
			'', secureFilenameNoExt) + fileExt.toLowerCase();
	},
	roundHasLocalTarget: function(round) {
		if(round) {
			expectedPath = path.join(
				__dirname, 'uploads', round.target_url);
			return fs.existsSync(expectedPath);
		} else {
			return false;
		}
	}
}
