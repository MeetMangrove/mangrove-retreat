var request = require('request')

function getWeather(latitude, longitude) {
	const url = 'https://api.darksky.net/forecast/0fe81fed15cafca7534a3b3d7e921229/'
	+ latitude + ',' + longitude
	request.get(url, function (error, response, body) {

	})
}
