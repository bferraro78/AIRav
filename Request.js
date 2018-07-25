var request = require('request');
var fs = require('fs');

const POLICIES = "/policies/"

exports.postPictureGoogleAPI = function (attachmentNames, callback) {

	console.log("\nPOST Phtotos...\n");

	// Create read streams for all files
	var attachmentsFullURL = createReadStreams(attachmentNames);
	console.log(attachmentsFullURL);

	var formData = {

		attachments: attachmentsFullURL,

	  // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
	  // Use case: for some types of streams, you'll need to provide "file"-related information manually.
	  // See the `form-data` README for more information about options: https://github.com/form-data/form-data
	  // custom_file: {
	  //   value:  fs.createReadStream('/dev/urandom'),
	  //   options: {
	  //     contentType: 'image/jpeg'
	  //   }
	  // }
	};

	/* POST Request, sending data to GOOGLE VISION API */
	request.post({url:'http://localhost:3000/', formData: formData}, function callback(err, httpResponse, body) {
		if (err) {
	    	console.error('upload failed:', err);
		}
			console.log('Upload successful!  Server responded with:', body);
	});

	callback();

}

function createReadStreams(attachmentNames) {
	var attachmentsFullURL = [];
	for (var i = 0; i < attachmentNames.length; i++) {
		var fullURLAttachment = __dirname + POLICIES + attachmentNames[i].name;
		attachmentsFullURL.push(fs.createReadStream(fullURLAttachment));
	}
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