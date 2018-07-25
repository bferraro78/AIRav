var builder = require('botbuilder');
var restify = require('restify');

// Express REST API / Server
var express = require('express'),
bodyParser = require('body-parser');

// 
var requestDriver = require('./Request.js');


// Set up Express server
var app = express(); // create Express.js object
app.use(bodyParser.json()); // req.body

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());


// Receive messages from the user
var bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);

// Saving data about the conversation
var inMemoryStorage = new builder.MemoryBotStorage();
var masterSession;

bot.on('conversationUpdate', (message) => {
	var User = (message.membersAdded[0]['name']);
    if (User === "User") {
        
        bot.beginDialog(message.address, '*:/');
    }
});



/* WATERFALLS */

function postGoogle() {
	console.log("inside post google");

	masterSession.beginDialog('postGoolgeVision');
}


/* DIALOGS */

// Root dialog
bot.dialog('/', [
    function (session) {
    	

    	masterSession = session;


    	session.send("Lets save you some money, eh?");
        builder.Prompts.text(session, 'First, What is your name?');
    },
    function (session, results) {
    	var name = session.message.text;
    	session.send("Hello %s!", name);

    	// Save name
    	session.userData.userName = name;

    	builder.Prompts.attachment(session, "Please upload pictures of your insurance polices." +
    		"Click on the image next to the left of the text box and shift click and many polices as you would like.");

    },
    function (session, results) {

    var msg = session.message;

    if (msg.attachments && msg.attachments.length > 0) {
		    var attachments = msg.attachments;
			session.beginDialog('sendPhotos', attachments);
	   }
    }
]);


// Send Photos to GoogleAPI
bot.dialog('sendPhotos', [
    function (session, attachments) {

    	masterSession = session;

    	console.log("attachments: " + attachments + "\n");
    	requestDriver.postPictureGoogleAPI(attachments, function() {
    		
    		console.log("Post google");

    		postGoogle();
    	}); 

	    // session.endDialog("Peace out %s", session.userData.userName);

    }
]);




// Send Photos to GoogleAPI
bot.dialog('postGoolgeVision', [
    function (session) {
    	console.log("Send back to user post google");
    	session.send("Did we make it here? Dope....");
	    session.endDialog("Peace out %s", session.userData.userName);
    }
]);




/* REST API FOR CONNECTING WITH GOOGLE VISION */

app.get('/:collection', function(req, res) { 
	var params = req.params;   
	var body = req.body; // JSON GOOGLE API


	// TODO - From here, we are getting the JSON info from GOOGLE VISION
	// 1. Fill in Data Model
	
	// 2. Start a dialog 
	masterSession.beginDialog('postGoolgeVision');
});



