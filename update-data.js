var fs = require('fs'),
	request = require('request'),
	moment = require('moment'),
	util = require('util');

var cities = {
        'bangalore': {
            label: 'Bangalore'
        },
        'boston': {
            label: 'Boston'
        },
        'geneva': {
            label: 'Geneva'
        },
        'rio': {
            label: 'Rio de Janeiro'
        },
        'san-francisco': {
            label: 'San Francisco'
        },
        'shanghai': {
            label: 'Shanghai'
        },
        'singapore': {
            label: 'Singapore'
        }
    };


var _year = 2015,
	_month = 2; // 0..11 months

for (city in cities) {
	fetchData(city, _year, _month);
}


/**
 * Builds a URL for the Data Canvas API that will get the aggregated data from all sensors at a resolution of 1 hour for the specified city and time period
 */
function buildUrl(cityLabel, year, month) {
	var currentDate = moment.utc([year, month]),
		fromDate = currentDate.clone().subtract(1,'months').endOf('month').format('YYYY-MM-DD'),
		toDate = currentDate.clone().add(1,'months').startOf('month').format('YYYY-MM-DD'),
		urlTemplate = 'http://sensor-api.localdata.com/api/v1/aggregations?op=mean&over.city=%s&from=%s&before=%s&resolution=1h&fields=temperature,humidity,dust,light,airquality_raw,sound',
		url = util.format(urlTemplate, cityLabel, fromDate, toDate);
	return url;
}

/**
 * Builds the filename for the specified city and time period.
 * Example: 2015-01-singapore.json
 */
function buildFilename(city, year, month) {
	var currentDate = moment.utc([year, month]);
	return util.format('./data/%s-%s.json', currentDate.format('YYYY-MM'), city);
}

/**
 * Saves the file on the filesystem
 */
function saveFile(filename, content) {
	fs.writeFile(filename, content, function(err) {
	    if (err) {
	        return console.log(err);
	    }
	});
	console.log(filename + ' was saved!');
}

/**
 * Fetches the data for the specified city and time
 */
function fetchData(city, year, month) {
	var url = buildUrl(cities[city].label, year, month);
	request(url, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("Fetching url: " + url);
			var filename = buildFilename(city, year, month);
			saveFile(filename, body);
		}
	});
}



