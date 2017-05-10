function haveDaysInCommon(days1, days2) {
	for (var i = 0; i < days1.length; i++) {
		var day1 = days1[i]
		for (var j = 0; j < days2.length; j++) {
			var day2 = days2[j]
			if (day1.id === day2.id) {
				return true
			}
		}
	}
	return false
}

function addBedsCountPerWeek(retreat, participants) {
	for (var i = 0; i < retreat.weeks.length; i++) {
		var bedsAvailable = retreat.house.beds
		var week = retreat.weeks[i]

		// Remove a bed each time a participant is found in the week
		for (var j = 0; j < participants.length; j++) {
			var participant = participants[j]
			if (haveDaysInCommon(week.days, participant.days)) {
				bedsAvailable -= 1
			}
		}

		// Add beds count to week
		retreat.weeks[i].beds = bedsAvailable
	}
	return retreat
}

module.exports = {
	addBedsCountPerWeek: addBedsCountPerWeek
}
