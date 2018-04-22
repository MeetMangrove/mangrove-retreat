var airtable = require('../helpers/airtable.js')
var retreat = require('./retreat.js')
var dateFormatter = require('../helpers/dateFormatter.js')
var bedsCounter = require('../helpers/bedsCounter.js')

function getParticipants(retreatId) {
  return new Promise(function (resolve, reject) {
    var participants = []

    airtable.participants.select({
      filterByFormula: "{Retreat Id} = '" + retreatId + "'"
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
}

function getFormattedParticipants(retreatId) {
  return new Promise(function (resolve, reject) {
    getParticipants(retreatId).then(function (participants) {
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

function getFormattedParticipantsIncludingDetails(retreatId) {
  return new Promise(function (resolve, reject) {
    getFormattedParticipants(retreatId).then(function (formattedParticipants) {
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
    const colors = getColors(detailedParticipants.length)

    for (var i = 0; i < detailedParticipants.length; i++) {
      var detailedParticipant = detailedParticipants[i]
      for (var j = 0; j < formattedParticipants.length; j++) {
        var formattedParticipant = formattedParticipants[j]
        if (formattedParticipant.id === detailedParticipant.id) {
          var tw = detailedParticipant.get('Twitter') && detailedParticipant.get('Twitter').length ? detailedParticipant.get('Twitter') : null
          var img = tw ? 'https://twitter.com/' + tw + '/profile_image?size=original' : null

          combinedParticipants.push({
            id: formattedParticipant.id,
            days: formattedParticipant.days,
            name: detailedParticipant.get('Name'),
            username: detailedParticipant.get('Name'),
            color: colors[i],
            avatar_url: img
          })
          break
        }
      }
    }

    return combinedParticipants

    function getColors(size) {
      const colors = ['#FF7900', '#FF00FF', '#7F00FF', '#0075FF', '#00CBFF', '#FF9800', '#FF00A1',
      '#7B00FF', '#006BFF', '#0096FF', '#FFBB00']
      const indexes = getShuffledIndexesOfSize(size)
      var randomColors = []

      for (var i = 0; i < indexes.length; i++) {
        var index = indexes[i]
        randomColors.push(colors[index % colors.length])
      }

      return randomColors

      function getShuffledIndexesOfSize(size) {
        var indexes = Array.apply(null, {length: size}).map(Number.call, Number)
        shuffle(indexes)
        return indexes

        function shuffle(array) {
          var m = array.length, t, i
          while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
          }
          return array;
        }
      }
    }
  }
}

function addParticipant(id, retreatId, firstNight, lastNight) {
  return new Promise(function (resolve, reject) {
    airtable.participants.create({
      Participant: [id],
      Retreat: [retreatId],
      'First Night': firstNight,
      'Last Night': lastNight
    }, function(err, record) {
      if (err) { reject(err); return; }
      resolve()
    })
  })
}

function getParticipantByMemberId(memberAirtableId) {
  return new Promise(function (resolve, reject) {
    airtable.members.find(memberAirtableId, function(err, record) {
      if (err) return reject(err)
      if (!record) return reject(`no Member with id=${memberAirtableId}`)
      resolve(record)
    })
  })
}

module.exports = {
  get: getFormattedParticipantsIncludingDetails,
  add: addParticipant,
  getParticipantByMemberId: getParticipantByMemberId
}
