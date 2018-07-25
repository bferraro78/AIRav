var request = require('request');
var fs = require('fs');


const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();


const POLICIES = "/policies/"

exports.postPictureGoogleAPI = function (attachmentNames, callback) {

	console.log("\nPOST Phtotos...\n");

	var fileName = __dirname + POLICIES + attachmentNames[0].name;

	// Performs text detection on the local file
	client.textDetection(fileName).then(results => {
		const detections = results[0].textAnnotations;
		detections.forEach(text => console.log(text));
	}).catch(err => {
		console.error('ERROR:', err);
	}); 

	// client
	// .imageProperties(fileNames)
	// .then(results => {
	// const properties = results[0].imagePropertiesAnnotation;
	// const colors = properties.dominantColors.colors;
	// colors.forEach(color => console.log(color));
	// })
	// .catch(err => {
	// console.error('ERROR:', err);
	// });

	// Create read streams for all files
	// var attachmentsFullURL = createReadStreams(attachmentNames);
	/* POST Request, sending data to GOOGLE VISION API */
	// request.post({url: "http://localhost:3000/", body: json.stringify(body)}, function callback(err, httpResponse, body) {
	// 	if (err) {
	//     	console.error('upload failed:', err);
	// 	}
	// 		console.log('Upload successful!  Server responded with:', body);
	// });





	callback();

}

function createReadStreams(attachmentNames) {
	var attachmentsFullURL = [];

	for (var i = 0; i < attachmentNames.length; i++) {
		var fullURLAttachment = __dirname + POLICIES + attachmentNames[i].name;
		
		// var readStream = fs.createReadStream(fullURLAttachment); 

		// var data = '';
		// readStream.on('data', function(chunk) {  
		// 	data += chunk;
		// }).on('end', function() {
		// 	attachmentsFullURL.push(data);
		// 	console.log(attachmentsFullURL);
		// }); 

		try {  
    		var data = fs.readFileSync(fullURLAttachment);
		    // console.log(data);    
		    attachmentsFullURL.push(data);
		} catch(e) {
		    console.log('Error:', e.stack);
		}

		
	}

	console.log(attachmentsFullURL);
	return attachmentsFullURL;
}

// function testRequest() {
// 	console.log("POSTING\n\n");

// 	request('http://www.google.com', function (error, response, body) {
// 	  console.log('error:', error); // Print the error if one occurred
// 	  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
// 	  console.log('body:', body); // Print the HTML for the Google homepage.
// 	});
// }