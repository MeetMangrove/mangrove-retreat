var Airtable = require('airtable')
var base = new Airtable({apiKey: 'keyqnZFJLYUXSgo93'}).base('appHUSN6KmmkMAgV7')

module.exports = {
	retreat: base('Retreat'),
	participants: base('Retreat Participants'),
	members: base('Members')
}
