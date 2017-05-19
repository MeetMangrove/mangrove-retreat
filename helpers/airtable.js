require('dotenv').config()

var Airtable = require('airtable')
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_KEY)

module.exports = {
	retreat: base('Retreat'),
	participants: base('Retreat Participants'),
	faq: base('Retreat FAQ'),
	members: base('Members')
}
