var builder = require('botbuilder');
var restify = require('restify');

// Express REST API / Server
var express = require('express'),
bodyParser = require('body-parser');

 
var requestDriver = require('./Request.js');

// AwsModel JSON
var AwsModel = require('./AwsModel.js');

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

// master session used to store all info for the entire chat
var masterSession;

bot.on('conversationUpdate', (message) => {
	var User = (message.membersAdded[0]['name']);
    if (User === "User") {
        
        bot.beginDialog(message.address, '*:/');
    }
});



/* WATERFALLS */
// Starts the new dialog after getting policy information
function postGoogle() {
	console.log("inside post google");
	masterSession.beginDialog('postGoolgeVision');
}


/* DIALOGS */

// Root dialog
bot.dialog('/', [
    function (session) {
    	
		setMasterSession(session);

    	session.send("Hello! I am AIRav. Lets find out if you have the right insurance.");

    sleep(3000).then(() => {
        session.send("*Disclaimer! Please give me all of the policies you own. My advise is only as good as the information you give me! We value your privacy, any information you provide will be kept secret.*");
        
    })
    
    sleep(6000).then(() => {
        builder.Prompts.text(session, 'First, I would like to know a little about you. Please type your name below in the text box.');
        
    })


    },
    function (session, results) {
    	var name = session.message.text;
        // Save name
        session.userData.userName = name;

    	session.send("Hello %s!", name);

        sleep(3000).then(() => {
            builder.Prompts.attachment(session, "Please upload pictures of your insurance polices. Include home, car, health, we need any and all types of policies you may have." +
            "Click on the image next to the left of the text box and shift click as many polices as you would like.");
        })




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

    	setMasterSession(session);

    	console.log("attachments: " + attachments[0].name + "\n");

    	requestDriver.postPictureGoogleAPI(attachments, function() {
    		// This function will coninute with the information given
    		postGoogle();
    	}); 
    }
]);



// Send Photos to GoogleAPI
bot.dialog('postGoolgeVision', [
    function (session) {    	
    	// 1. How is your living situation ? home owner or renter
        // builder.Prompts.number(session, 'First queston, are you a homeowner?'); RICHA MAY NOT WANT, TOO FLASHY FOR RENTERS CHOICE
        sleep(3000).then(() => {
            builder.Prompts.choice(session, "Since you have an auto policy, I need to know whether you currently own a home or are renting.", "I own a home|I am renting",{ listStyle: 3 });
        })
		
    }, 
    function (session, results) {
        var homeOrRent = results.response.entity;
        // set home owner logic
        if (homeOrRent == "I own a home") {
            session.userData.homeowner = "Home Owner"
        } else {
            session.userData.homeowner = "Renter"
        }
        
        setMasterSession(session);

        sleep(2250).then(() => {
            session.send("Great! Now I would like to ask you a few more questions.");
            if (session.userData.homeowner == "Home Owner") {
                // Home owner dialogs
                console.log("Home Owner Path");

                session.beginDialog('homeOwnersPath');

            } else {
                // Renters dialogs
                console.log("Renter Path");

                session.beginDialog('finalInfoGather');
            }
        })


    }
]);


bot.dialog('homeOwnersPath', [ 
    function (session) {
        // 1a. How long have you owned your home
        sleep(3000).then(() => {
            builder.Prompts.number(session, "How many years have you owned your home? (If less than one year, write in 1).");
        })
    }, 
    function(session, results) {

        session.userData.yearsOwnedHome = results.response;
        setMasterSession(session);

        // 1b. What is the approx market vaule fo your home
        sleep(3000).then(() => {
            builder.Prompts.number(session, "What is the approximate vaule of your home?");
        })
        
    },
    function(session, results) {
        session.userData.homeValue = results.response;
        setMasterSession(session);
        session.beginDialog('finalInfoGather');

    }
]);

bot.dialog('finalInfoGather', [ 
    function (session) {
        // 2. How much do you have saved up in any long term finanial assets outside of your 401k or retirement plans. Mutual funds, bonds, etc. (Total Finanical Assets)
        sleep(3000).then(() => {
            builder.Prompts.number(session, "How much do you have saved up in any long term finanial assets outside of your 401k or retirement plans (Mutual funds, bonds, etc.).");
        })
    },
    function(session, results) {
        session.userData.totalFinancialAssests = results.response;
        setMasterSession(session);

        // 3. What is your approximate annual income?
        sleep(3000).then(() => {
            builder.Prompts.number(session, "What is your approximate annual income?");
        })
        
    },
    function(session, results) {
        session.userData.yearlyIncome = results.response;
        setMasterSession(session);
        masterSession.endDialog("Thank you for your answers %s! Your advise is on its way...", masterSession.userData.userName);

        // Calculate Net Worth/Net Worth Income
        calculateInput(masterSession);


        //Advise on MINIMUM Liability Limit Increase - A1

        // Set AwsModel JSON Object
        var awsModel =  {
            "Row" : 0,
            "Liability Limit Per person" : 25000, // take from sheet
            "Liability Limit Per accident" : 50000, // take from sheet
            "Market Value of Home" : masterSession.userData.homeValue,
            "Years living in home" : masterSession.userData.yearsOwnedHome,
            "Value of financial assets (not including 401k)" : masterSession.userData.totalFinancialAssests,
            "Average Annual Income" : masterSession.userData.yearlyIncome,
            "Net Worth" : masterSession.userData.netWorth,
            "Net Worth + Income" : masterSession.userData.netWorthPlusIncome
        }

        console.log(awsModel);

        // Send AwsModel 

        // ADVISE Limitied Liability Limit advise
        // ADVISE - 
        // 0 - say noting about umbrella
        //1 - consider taking umbrella policy

        // TODO - WIPE MASTER SESSION!!!
    }
]);


function calculateInput(masterSession) {
        
        var userData = masterSession.userData;

        var totalFinancialAssests = userData.totalFinancialAssests;
        var twentyPercentHomeValue = (userData.homeValue * .20);
        var twentyPercentYearlyIncome = (userData.yearlyIncome*.20);
        var thirdOfYearsOwnedHouse = (userData.yearsOwnedHome / 30);

        var netWorth;
        var netWorthPlusIncome;

    if (userData.homeowner == "Home Owner") {
        // Home Owners

        netWorth = totalFinancialAssests + twentyPercentHomeValue + (thirdOfYearsOwnedHouse*.80);
        netWorthPlusIncome = netWorth + twentyPercentYearlyIncome;


    } else {
        // Renters
        netWorth = totalFinancialAssests;
        netWorthPlusIncome = netWorth + twentyPercentYearlyIncome;
    }

    masterSession.userData.netWorth = netWorth;
    masterSession.userData.netWorthPlusIncome = netWorthPlusIncome;

}




/* REST API FOR CONNECTING WITH GOOGLE VISION */

app.get('/:collection', function(req, res) { 
	var params = req.params;   
	var body = req.body; // JSON GOOGLE API


	// TODO - From here, we are getting the JSON info from GOOGLE VISION
	// 1. Fill in Data Model
	
	// 2. Start a dialog 
	masterSession.beginDialog('postGoolgeVision');
});


/* Utilities */
function setMasterSession(session) {
	masterSession = session;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

