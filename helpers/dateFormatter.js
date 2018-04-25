function formatDay(date) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec']
  return {
    id: months[date.getMonth() - 1] + date.getDate(),
    name: weekDays[date.getDay()],
    number: date.getDate(),
    month: months[date.getMonth() - 1],
    date: date
  }
}

function formatWeeks(beginDate, endDate) {
  var days = []
  var day = new Date(beginDate)

  while(day.getTime() < new Date(endDate).getTime()) {
    days.push(formatDay(day))
    day = new Date(day.getTime() + 24 * 60 * 60 * 1000)
  }
  days.push(formatDay(new Date(endDate)))

  var weeks = []
  for (var i = 0; i < days.length; i++) {
    if (i % 7 == 0) {
      weeks.push({days: []})
    }
    var weekIndex = parseInt(i / 7)
    weeks[weekIndex].days.push(days[i])
  }

  return weeks
}

function formatDays(beginDate, endDate) {
  var days = []
  var day = new Date(beginDate)

  while(day.getTime() < new Date(endDate).getTime()) {
    days.push(formatDay(day))
    day = new Date(day.getTime() + 24 * 60 * 60 * 1000)
  }
  days.push(formatDay(new Date(endDate)))

  return days
}

module.exports = {
  formatDays: formatDays,
  formatWeeks: formatWeeks
}
