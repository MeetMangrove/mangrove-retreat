const _ = require('lodash')
const moment = require('moment-timezone')
var airtable = require('../helpers/airtable.js')
var dateFormatter = require('../helpers/dateFormatter.js')
var weather = require('./weather.js')

function getRetreat(slug) {
  return new Promise(function (resolve, reject) {
    airtable.retreat.select({
      maxRecords: 1,
      filterByFormula: `{Slug}='${slug}'`,
    }).firstPage(function(err, records) {
      if (err) return reject(err)
      // TODO: properly handle when no ongoing retreat in Airtable
      if (!records.length) return reject("found no ongoing retreats on Airtable")
      resolve(records[0])
    })
  })
  .then(function(retreat) {
    return getOrganizer(retreat).then(function(organizer) {
      const formattedRetreat = formatRetreat(retreat)
      formattedRetreat.organizer = organizer
      return formattedRetreat
    })
  })
  .then(addWeatherIfAvailable)

  function addWeatherIfAvailable(retreat) {
    const lat = retreat.location.latitude
    const lng = retreat.location.longitude
    return new Promise(function(resolve, reject) {
      return weather.getTemperatureAndLocalTime(lat, lng).then(function (result) {
        retreat.localTime = result.localTime
        retreat.temperature = result.temperature
        resolve(retreat)
      }).catch(function(err) {
        console.log(`WARNING failed to get weather for retreat: ${err}`)
        // resolve anyway: weather is optional
        resolve(retreat)
      })
    })
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
      username: organizer.get('Slack Handle')
    }
  }
}


function getCurrent() {
  return new Promise(function (resolve, reject) {
    airtable.retreat.select({
      // TODO: this fetches the 10 most recent retreats which is not technically
      // guaranteed to include the one closest to today, but looks good enough
      maxRecords: 10,
      sort: [{field: 'First Night', direction: 'desc'}],
    }).firstPage(function(err, records) {
      if (err) return reject(err)
      if (!records.length) return reject(`no retreats found on Airtable`)
      // pick retreat closest to today
      const now = moment()
      const closest = _.first(_.orderBy(records, function(r) {
        return Math.abs(now.diff(r.get('First Night')))
      }))
      resolve(formatRetreat(closest))
    })
  })
}


function formatRetreat(retreat) {
  return {
    id: retreat.id,
    slug: retreat.get('Slug'),
    weeks: dateFormatter.formatWeeks(retreat.get('First Night'), retreat.get('Last Night')),
    name: retreat.get('Name'),
    description: retreat.get('Description'),
    channel: retreat.get('Channel'),
    house : formatHouse(retreat),
    price: formatPrice(retreat),
    totalPrice: retreat.get('Total Price'),
    generated: retreat.get('Generated'),
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

module.exports = {
  get: getRetreat,
  getCurrent,
}
