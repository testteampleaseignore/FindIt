const inflector = require('inflected');


module.exports = {
	congratulations: function(place, round) {
    	console.log(`place: ${place}`);
    	return (`You were right! You placed ${place}${inflector.ordinal(place)} ` +
    		    `for round ${round.id}. Nice job!`); 
    },
    sorry: function(round) {
    	return `Sorry! You haven't actually found the location for this round yet. ` +
    	       'Keep searching!';
    },
    selfguess: "You made that round! You can't participate in guessing where it is.",
    somethingWentWrong: "Something went wrong. That's all we know.",
    roundCreated: "Round successfully created."
}