const request = require('request')
const clientId = '24629294631.166278537604'
const clientSecret = '7fedc702b17499b262d1bab10d1fa7ad'
const slackRedirectUri = process.env.SLACK_REDIRECT_URI ? process.env.SLACK_REDIRECT_URI : 'http://localhost:3000/auth'
const airtable = require('../helpers/airtable.js')

function checkCode(code) {
	return new Promise(function (resolve, reject) {
		request.get('https://slack.com/api/oauth.access?code=' + code + '&client_id=' + clientId
		+ '&client_secret=' + clientSecret + '&redirect_uri=' + slackRedirectUri,
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					const b = JSON.parse(body)
					getUserInfo(b.access_token, b.user.id).then(function (username) {
						resolve(username)
					})
				} else { reject(error) }
			})
	})
}

function getUserInfo(token, userId) {
	return new Promise(function (resolve, reject) {
		request.get('https://slack.com/api/users.info?token=' + token + '&user=' + userId,
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body).user.name)
			} else { reject(error) }
		})
	})
}

function getCurrentUserDetail(username) {
	return new Promise(function (resolve, reject) {
		airtable.members.select({
			filterByFormula: "{Slack Handle} = '@" + username + "'"
		}).firstPage(function(err, records) {
			if (err) { reject(err); return }
			if (typeof records[0] !== 'undefined') {
				resolve(formatCurrentUser(records[0]))
			} else {
				reject('No members found matching username : ' + username)
			}
		})
	})

	function formatCurrentUser(currentUser) {
		const tw = currentUser.get('Twitter') && currentUser.get('Twitter').length ? currentUser.get('Twitter') : null
		const img = tw ? 'https://twitter.com/' + tw + '/profile_image?size=original' : null

		return {
			id: currentUser.id,
			name: currentUser.get('Name'),
			username: currentUser.get('Slack Handle'),
			color: 'black',
			avatar_url: img
		}
	}
}

module.exports = {
	checkCode: checkCode,
	getCurrentUserDetail: getCurrentUserDetail
}
