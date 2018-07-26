const aaaParser = {
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
            if (currentNode.startsWith('BODILY INJURY LIABILITY')) {
                var limits = splittedText[i + 1].split('/');
                //$250,000 Each Person/$500,000 Each Accident
                liabperson = limits[0];
                liabaccident = limits[1];
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

module.exports = aaaParser