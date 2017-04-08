const request = require('request');
const clientId = '24629294631.166278537604'
const clientSecret = '7fedc702b17499b262d1bab10d1fa7ad'

function checkCode(code) {
	return new Promise(function (resolve, reject) {
		request.get('https://slack.com/api/oauth.access?code=' + code + '&client_id=' + clientId + '&client_secret=' + clientSecret,
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
module.exports = {
	checkCode: checkCode
}
