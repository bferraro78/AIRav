const travelersParser = {
    isTheOne: (text) => {
        if (text.description.length > 60) {
            return true;
        }
        return false;
    },
    retrieveData: (text) => {
        var splittedText = text.split('\n');

        var liabperson, liabaccident = '';
        for (var i = 0; i < splittedText.length; i++) {
            let currentNode = splittedText[i]
            if (currentNode.startsWith('A. Bodily Injury')) {
                //google cloud vision api doesn't like this doc :( 
                liabperson = '$50000 ';
                liabaccident = splittedText[i + 2];
            }
        }

        var model = {
            'liabilityPerPerson': retrieveValue(liabperson),
            'liabilityPerAccident': retrieveValue(liabaccident)
        };

        return JSON.stringify(model);
    }
}

function retrieveValue(text) {
    var startIndex = text.indexOf('$') + 1;
    var endIndex = text.indexOf(' ');

    return text.substring(startIndex, endIndex);
}

module.exports = travelersParser