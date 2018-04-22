const request = require('request')
const clientId = process.env.SLACK_CLIENT_ID
const clientSecret = process.env.SLACK_CLIENT_SECRET
const slackRedirectUri = process.env.SLACK_REDIRECT_URI
const airtable = require('../helpers/airtable.js')


function checkCode(code) {
  return new Promise(function (resolve, reject) {
    request.get('https://slack.com/api/oauth.access?code=' + code + '&client_id=' + clientId
    + '&client_secret=' + clientSecret + '&redirect_uri=' + slackRedirectUri,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          body = JSON.parse(body)
          if (body.error) return reject(body.error)
          // resolve with user AccessToken and Slack ID
          resolve({
            slackId: body.user_id,
            accessToken: body.access_token,
          })
        } else { reject(error) }
      })
  })
}

// retrieves details about a Member from Airtable based on their Slack ID
function getMemberBySlackId(slackId) {
  return new Promise(function (resolve, reject) {
    airtable.members.select({
      maxRecords: 10,
      filterByFormula: `{Slack ID} = '${slackId}'`,
    }).firstPage(function(err, records) {
      if (err) { reject(err); return }
      if (typeof records[0] !== 'undefined') {
        resolve(formatMember(records[0]))
      } else {
        reject('No members found matching username : ' + username)
      }
    })
  })

  function formatMember(currentUser) {
    const tw = currentUser.get('Twitter') && currentUser.get('Twitter').length ? currentUser.get('Twitter') : null
    const img = tw ? 'https://twitter.com/' + tw + '/profile_image?size=original' : null

    return {
      id: currentUser.id,
      name: currentUser.get('Name'),
      slackId: currentUser.get('Slack ID'),
      color: 'black',
      avatar_url: img
    }
  }
}

module.exports = {
  checkCode: checkCode,
  getMemberBySlackId: getMemberBySlackId
}