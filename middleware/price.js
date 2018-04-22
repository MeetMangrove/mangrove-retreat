var airtable = require('../helpers/airtable.js')
var dateFormatter = require('../helpers/dateFormatter.js')

var firstNight
var lastNight
var retreat

Date.prototype.isSameDateAs = function(aDate) {
  return (
    this.getFullYear() === aDate.getFullYear() &&
    this.getMonth() === aDate.getMonth() &&
    this.getDate() === aDate.getDate()
  )
}

function compute(params) {
  return new Promise(function (resolve, reject) {
    firstNight = new Date(params.firstNight)
    lastNight = new Date(params.lastNight)
    const retreatId = params.retreatId
    if (typeof firstNight === 'undefined' || typeof lastNight === 'undefined'
      || retreatId === 'undefined') {
      reject('Params are not correct. You should send retreatId, firstNight and lastNight')
      return
    }


    getRetreat(retreatId).then(function () {
      if (isFullWeekStay()) {
        resolve(getPricesForFullWeekStay())
      } else {
        resolve(getPricesForCustomStay())
      }
    })

    function getRetreat(retreatId) {
      return new Promise(function (resolve, reject) {
        airtable.retreat.find(retreatId, function(err, record) {
          if (err) { reject(err); return }
          retreat = record
          resolve()
        })
      })
    }

    function isFullWeekStay() {
      const weeks = dateFormatter.formatWeeks(retreat.get('First Night'), retreat.get('Last Night'))
      var firstNightMatches = false
      var isFullWeek = false

      for (var i = 0; i < weeks.length; i++) {
        var week = weeks[i]
        if (week.days[0].date.isSameDateAs(firstNight)) {
          firstNightMatches = true
        }

        if (firstNightMatches && week.days[week.days.length - 1].date.isSameDateAs(lastNight)) {
          isFullWeek = true
        }
      }

      return isFullWeek
    }

    function getPricesForFullWeekStay() {
      const weeksCount = getWeeksCount()

      return {
        price: retreat.get('Price Per Week') * weeksCount,
        discount: retreat.get('Week Discount') * weeksCount,
        canBook: true,
        description: getDescription(weeksCount)
      }

      function getWeeksCount() {
        const weeks = dateFormatter.formatWeeks(retreat.get('First Night'), retreat.get('Last Night'))
        var firstNightWeekIndex = -1
        var lastNightWeekIndex = -1

        for (var i = 0; i < weeks.length; i++) {
          var week = weeks[i]
          if (week.days[0].date.isSameDateAs(firstNight)) {
            firstNightWeekIndex = i
          }

          if (week.days[week.days.length - 1].date.isSameDateAs(lastNight)) {
            lastNightWeekIndex = i
          }
        }

        return (1 + lastNightWeekIndex - firstNightWeekIndex)
      }

      function getDescription(weeksCount) {
        var description = 'Booking ' + weeksCount + ' week'
        if (weeksCount > 1) {
          description += 's'
        }
        description += ' for ' + retreat.get('Name')
        return description
      }
    }

    function getPricesForCustomStay() {
      const timeDifference = lastNight.getTime() - firstNight.getTime()
      const numberOfDays = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1
      const pricePerNight =  retreat.get('Price Per Night')

      return {
        price: pricePerNight * numberOfDays,
        discount: 0,
        canBook: false,
        description: ''
      }
    }
  })
}

module.exports = {
  compute: compute
}
