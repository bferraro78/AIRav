var AWS = require('aws-sdk');

const awsAdapter = {
    'getPrediction': (awsModel, callback) => {
        configureAWS();
        var machinelearning = new AWS.MachineLearning();
        machinelearning.predict(awsModel, function (err, data) {
            if (err) {
                //error
                console.log(err, err.stack)
            }
            else {
                //success
                // console.log("Data: " + data);
                callback(data);
            }
        });
    }
}

function configureAWS() {
    AWS.config = new AWS.Config();
    AWS.config.accessKeyId = 'AKIAJ2RTK6GGWUG5WPRA';
    AWS.config.secretAccessKey = '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';
    AWS.config.region = "us-east-1";
}

module.exports = awsAdapter