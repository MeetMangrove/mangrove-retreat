require('dotenv').config()

const slackTeamName = (process.env.SLACK_TEAM_NAME || 'mangroveteam')
const slackClientId = process.env.SLACK_CLIENT_ID
const slackRedirectUri = process.env.SLACK_REDIRECT_URI
const slackAuthorizeUri = 'https://slack.com/oauth/authorize?' +
  'team=' + slackTeamName +
  '&scope=users:read&client_id=' + slackClientId +
  '&redirect_uri=' + slackRedirectUri
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY : 'sk_test_5T8O9RZssCDArs5Qvab937KI'
const airtableApiKey = process.env.AIRTABLE_API_KEY
const airtableBaseKey = process.env.AIRTABLE_BASE_KEY

module.exports = {
    slackTeamName,
    slackClientId,
    slackRedirectUri,
    slackAuthorizeUri,
    stripeSecretKey,
    airtableApiKey,
    airtableBaseKey
}
