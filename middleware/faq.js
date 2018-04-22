var airtable = require('../helpers/airtable.js')

function getFormattedFAQ(retreatId) {
  return new Promise(function (resolve, reject) {
    getFAQ(retreatId).then(function (faq) {
      resolve(formatFAQ(faq))
    })
  })

  function getFAQ(retreatId) {
    return new Promise(function (resolve, reject) {
      airtable.faq.select({
        filterByFormula:  "{Retreat Id} = '" + retreatId + "'"
      }).firstPage(function(err, records) {
        if (err) return reject(err)
        if (!records.length) return reject("missing FAQ")
        resolve(formatFAQ(records[0]))
      })
    })
  }

  function formatFAQ(faq) {
    var formattedFAQ = []

    const fields = faq.fields
    for (var key in fields) {
      if (fields.hasOwnProperty(key)) {
        if (key !== 'Name' && key !== 'Retreat' && key !== 'Retreat Id') {
          formattedFAQ.push({
            question: key,
            answer: fields[key]
          })
        }
      }
    }

    return formattedFAQ
  }
}

module.exports = {
  get: getFormattedFAQ
}
