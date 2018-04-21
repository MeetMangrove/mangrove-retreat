var request = require('request')
var moment = require('moment-timezone');

function getTemperatureAndLocalTime(latitude, longitude) {
	return new Promise(function (resolve, reject) {
    if (!latitude || !longitude) return reject(`missing latitude and/or longitude`)
		const url = 'https://api.darksky.net/forecast/0fe81fed15cafca7534a3b3d7e921229/'
		+ latitude + ',' + longitude + '?exclude=minutely,hourly,daily,alerts,flags&units=si'
		request.get(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve({
					temperature: JSON.parse(body).currently.temperature.toFixed(1),
					localTime: moment().tz(JSON.parse(body).timezone).format('HH:mm')
				})
			} else {
				reject(error || `status ${response.statusCode} ${body}`)
			}
		})
	})
}

module.exports = {
	getTemperatureAndLocalTime: getTemperatureAndLocalTime
}
