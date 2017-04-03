var airtable = require('./airtable.js')
var retreat = require('./retreat.js')
var dateFormatter = require('../helpers/dateFormatter.js')
var bedsCounter = require('../helpers/bedsCounter.js')

function formatParticipants(participants) {
	var formattedParticipants = []

	participants.forEach(function(record) {
		var id = ''
		if (typeof record.get('Participant') !== 'undefined') {
			id = record.get('Participant')[0]
		}
		formattedParticipants.push({
			days: dateFormatter.formatDays(record.get('First Night'), record.get('Last Night')),
			id: id
		})
	})

	return formattedParticipants
}

function getFormulaForParticipantsDetail(participants) {
	var formula = 'OR('

	for (var i = 0; i < participants.length; i++) {
		var participant = participants[i]
		formula += "RECORD_ID() = '" + participant.id + "'"
		if (i < participants.length - 1) {
			formula += ', '
		}
	}

	formula += ')'
	return formula
}

function appendParticipantsDetail(formattedParticipants, detailedParticipants) {
	var combinedParticipants = []

	for (var i = 0; i < detailedParticipants.length; i++) {
		var detailedParticipant = detailedParticipants[i]
		for (var j = 0; j < formattedParticipants.length; j++) {
			var formattedParticipant = formattedParticipants[j]
			if (formattedParticipant.id === detailedParticipant.id) {
				combinedParticipants.push({
					id: formattedParticipant.id,
					days: formattedParticipant.days,
					name: detailedParticipant.get('Name'),
					slack: detailedParticipant.get('Slack Handle')
				})
				break
			}
		}
	}

	return combinedParticipants
}

function getParticipantsDetail(participants) {
	return new Promise(function (resolve, reject) {
		var detailedParticipants = []
		airtable.members.select({
			filterByFormula: getFormulaForParticipantsDetail(participants),
		}).eachPage(function page(records, fetchNextPage) {
			records.forEach(function(record) {
					detailedParticipants.push(record)
			})

			fetchNextPage()
		}, function done(err) {
			if (err) {
				console.log(err);
				reject(err)
				return
			}

			resolve(appendParticipantsDetail(participants, detailedParticipants))
		})
	})
}

function getParticipants() {
	return new Promise(function (resolve, reject) {
		var participants = []

		// Get retreat
		retreat.get().then(function (retreatObject) {
			// Get participants
			const formula = "{Retreat Id} = '" + retreatObject.id + "'"
			airtable.participants.select({
				filterByFormula: formula
			}).eachPage(function page(records, fetchNextPage) {
				records.forEach(function(record) {
					participants.push(record)
				})

				fetchNextPage()
			}, function done(err) {
				if (err) {
					reject(err)
					return
				}

				var formattedParticipants = formatParticipants(participants)
				getParticipantsDetail(formattedParticipants).then(function (combinedParticipants) {
					resolve({
						retreat: bedsCounter.addBedsCountPerWeek(retreatObject, combinedParticipants),
						participants: combinedParticipants
					})
				}, function (error) {
					reject(err)
				})
			})
		})
	})
}

module.exports = {
	get: getParticipants
}
