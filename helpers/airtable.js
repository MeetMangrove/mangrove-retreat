var Airtable = require('airtable')
const {airtableApiKey, airtableBaseKey} = require('../src/constants.js')


var base = new Airtable({apiKey: airtableApiKey}).base(airtableBaseKey)


module.exports = {
  retreat: base('Retreats'),
  participants: base('Retreat Participants'),
  faq: base('Retreat FAQ'),
  members: base('Members')
}
