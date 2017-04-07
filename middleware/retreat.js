var airtable = require('../helpers/airtable.js')
var dateFormatter = require('../helpers/dateFormatter.js')
var weather = require('./weather.js')

function getRetreat() {
	return new Promise(function (resolve, reject) {
		airtable.retreat.select({
			maxRecords: 1,
			filterByFormula: "IS_BEFORE(NOW(), {Last Night})",
		}).firstPage(function(err, records) {
			if (err) {
				reject(err)
				return
			}

			if (typeof records[0] !== 'undefined') {
				const retreat = records[0]
				getOrganizer(retreat).then(function (organizer) {
					var formattedRetreat = formatRetreat(retreat)
					formattedRetreat.organizer = organizer
					weather.getTemperatureAndLocalTime(retreat.get('Latitude'), retreat.get('Longitude')).then(
						function (result) {
							formattedRetreat.localTime = result.localTime
							formattedRetreat.temperature = result.temperature
							resolve(formattedRetreat)
					})
				})
			}
		})
	})

	function formatRetreat(retreat) {
		return {
			id: retreat.id,
			weeks: dateFormatter.formatWeeks(retreat.get('First Night'), retreat.get('Last Night')),
			name: retreat.get('Name'),
			description: retreat.get('Description'),
			channel: retreat.get('Channel'),
			house : formatHouse(retreat),
			price: formatPrice(retreat),
			location: formatLocation(retreat),
		}

		function formatHouse(retreat) {
			return {
				url: retreat.get('House Url'),
				beds: retreat.get('Beds'),
				pictures: formatPictures(retreat.get('Pictures')),
				rentPrice: retreat.get('House Rent Price')
			}

			function formatPictures(pictures) {
				var formattedPictures = []

				if (typeof pictures !== 'undefined') {
					for (var i = 0; i < pictures.length; i++) {
						var picture = pictures[i]
						formattedPictures.push(picture.url)
					}
				}

				return formattedPictures
			}
		}

		function formatPrice(retreat) {
			return {
				perWeek: retreat.get('Price Per Week'),
				perNight: retreat.get('Price Per Night'),
				weekDiscount: retreat.get('Week Discount')
			}
		}

		function formatLocation(retreat) {
			return {
				latitude: retreat.get('Latitude'),
				longitude: retreat.get('Longitude'),
				fullAddress: retreat.get('Address'),
				city: retreat.get('City'),
				country: retreat.get('Country')
			}
		}
	}
}

function getOrganizer(retreat) {
	return new Promise(function (resolve, reject) {
		const organizerId = retreat.get('Organizer')[0]
		if (typeof organizerId !== 'undefined') {
			airtable.retreat.find(organizerId, function(err, organizer) {
				if (err) { reject(err); return }
				resolve(formatOrganizer(organizer))
			})
		}
	})

	function formatOrganizer(organizer) {
		return {
			id: organizer.id,
			name: organizer.get('Name'),
			slack: organizer.get('Slack Handle')
		}
	}
}

module.exports = {
	get: getRetreat
}
