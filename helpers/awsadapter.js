var AWS = require('aws-sdk');

const awsAdapter = {
    'getPrediction': (awsModel) => {
        configureAWS();
        var machinelearning = new AWS.MachineLearning();
        machinelearning.predict(awsModel, function (err, data) {
            if (err) {
                //error
                console.log(err, err.stack)
            }
            else {
                //success
                console.log(data);
            }
        });
    }
}

function configureAWS() {
    AWS.config = new AWS.Config();
    AWS.config.accessKeyId = '';
    AWS.config.secretAccessKey = '';
    AWS.config.region = "us-east-1";
}

module.exports = awsAdapter