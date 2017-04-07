var airtable = require('../helpers/airtable.js')
var retreat = require('./retreat.js')
var dateFormatter = require('../helpers/dateFormatter.js')
var bedsCounter = require('../helpers/bedsCounter.js')

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
				if (err) { reject(err); return }
				resolve(participants)
			})
		})
	})
}

function getFormattedParticipants() {
	return new Promise(function (resolve, reject) {
		getParticipants().then(function (participants) {
			resolve(formatParticipants(participants))
		})
	})

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
}

function getFormattedParticipantsIncludingDetails() {
	return new Promise(function (resolve, reject) {
		getFormattedParticipants().then(function (formattedParticipants) {
			getParticipantsDetail(formattedParticipants).then(function (detailedParticipants) {
				resolve(getCombinedParticipants(formattedParticipants, detailedParticipants))
			})
		})
	})

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
				if (err) { reject(err); return }
				resolve(detailedParticipants)
			})
		})

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
	}

	function getCombinedParticipants(formattedParticipants, detailedParticipants) {
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
}

module.exports = {
	getDetailed: getFormattedParticipantsIncludingDetails,
	get: getParticipants
}
