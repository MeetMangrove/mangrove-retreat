var airtable = require('./airtable.js')
var dateFormatter = require('../helpers/dateFormatter.js')

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

function formatRetreat(retreat) {
	return {
		id: retreat.id,
		weeks: dateFormatter.formatWeeks(retreat.get('First Night'), retreat.get('Last Night')),
		name: retreat.get('Name'),
		description: retreat.get('Description'),
		channel: retreat.get('Channel'),
		house : {
			url: retreat.get('House Url'),
			beds: retreat.get('Beds'),
			pictures: formatPictures(retreat.get('Pictures')),
			rentPrice: formatPictures(retreat.get('House Rent Price'))
		},
		price: {
			perWeek: retreat.get('Price Per Week'),
			perNight: retreat.get('Price Per Night')
		},
		location: {
			latitude: retreat.get('Latitude'),
			longitude: retreat.get('Longitude'),
			fullAddress: retreat.get('Address'),
			city: retreat.get('City'),
			country: retreat.get('Country')
		}
	}
}

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

			records.forEach(function(record) {
				const retreat = record
				resolve(formatRetreat(retreat))
			})
		})
	})
}

module.exports = {
	get: getRetreat
}
