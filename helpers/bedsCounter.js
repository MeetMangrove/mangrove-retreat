function haveDaysInCommon(days1, days2) {
	for (var i = 0; i < days1.length; i++) {
		var day1 = days1[i]
		for (var i = 0; i < days2.length; i++) {
			var day2 = days2[i]
			if (day1.id === day2.id) {
				return true
			}
		}
	}
	return false
}

function addBedsCountPerWeek(retreat, participants) {
	var beds = retreat.house.beds
	var bedsPerWeek = []

	for (var i = 0; i < retreat.weeks.length; i++) {
		bedsPerWeek.push(beds)
		var week = retreat.weeks[i]

		// Remove a bed each time a participant is found in the week
		for (var j = 0; j < participants.length; j++) {
			var participant = participants[j]
			if (haveDaysInCommon(week.days, participant.days)) {
				bedsPerWeek[i] -= 1
			}
		}

		// Add beds count to week
		retreat.weeks[i].beds = bedsPerWeek[i]
	}

	console.log(retreat)
	return retreat
}

module.exports = {
	addBedsCountPerWeek: addBedsCountPerWeek
}
