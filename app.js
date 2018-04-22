require('dotenv').config()
var _ = require('lodash')
var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser')
var sassMiddleware = require('node-sass-middleware')
var postcssMiddleware = require('postcss-middleware');
var autoprefixer = require('autoprefixer');

const slackRedirectUri = process.env.SLACK_REDIRECT_URI
const slackClientId = process.env.SLACK_CLIENT_ID
const slackTeamName = (process.env.SLACK_TEAM_NAME || 'mangroveteam')
const slackAuthorizeUri = "https://slack.com/oauth/authorize?" +
  "team=" + slackTeamName +
  "&scope=users:read&client_id=" + slackClientId +
  "&redirect_uri=" + slackRedirectUri

var index = require('./routes/index')

var app = express()

// session cookies
app.use(cookieSession({
  name: 'mangrove-retreat-session',
  keys: _.filter([process.env.SECRET_KEY, 'M@ngR0ve']),
  maxAge: 30 * 24 * 3600 * 1000 // 30 days
}))

// expose session to templates, accessible as `session` via `res.locals`
app.use(function (req, res, next) {
  res.locals.session = req.session
  next()
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// locals
app.locals._  = _;
app.locals.cx = require('classnames');
app.locals.slackAuthorizeUri = slackAuthorizeUri
app.locals.slackRedirectUri = slackRedirectUri

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/stylesheets', sassMiddleware({
  src:  __dirname + '/public/sass',
  dest: __dirname + '/public/stylesheets',
  debug: true,
  outputStyle: 'expanded'
}))

app.use('/stylesheets', postcssMiddleware({
  src: function(req) {
    return path.join(__dirname, 'public', 'stylesheets', req.path)
  },
  plugins: [autoprefixer()]
}))

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  const isDev = req.app.get('env') === 'development'

  // render the error page
  res.status(err.status || 500)
  res.render('error', {error: isDev ? err : null})
})

// proper logging of UnhandledPromiseRejection
process.on('unhandledRejection', function(reason, p) {
  console.log("Possibly Unhandled Rejection at: Promise ",
    p, " reason: ", reason, reason ? reason.message : null)
})

module.exports = app
