const _ = require('lodash')
const express = require('express')
const router = express.Router()
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY ? process.env.STRIPE_PUBLISHABLE_KEY : 'pk_test_BFpNYeuEnZ50FMwhi59JZs2c'
const slackRedirectUri = process.env.SLACK_REDIRECT_URI
const slackClientId = process.env.SLACK_CLIENT_ID
const bedsCounter = require('../helpers/bedsCounter.js')

const participants = require('../middleware/participants.js')
const retreat = require('../middleware/retreat.js')
const faq = require('../middleware/faq.js')
const price = require('../middleware/price.js')
const auth = require('../middleware/auth.js')
const charge = require('../middleware/charge.js')

router.get('/', function(req, res) {
  res.redirect('https://www.mangrove.io/retreats');
})

router.get('/:slug', function(req, res, next) {
	const slug = req.params.slug;
	retreat.get(slug).then(function (formattedRetreat) {
		participants.get(formattedRetreat.id).then(function (formattedParticipants) {
			faq.get(formattedRetreat.id).then(function (faq) {
				var result = bedsCounter.addBedsCountPerWeek(formattedRetreat, formattedParticipants)
				console.log(formattedRetreat.name)
				res.render('index', _.merge(result, {
					participants: formattedParticipants,
					faq: faq,
					slackRedirectUri: slackRedirectUri + '/' + slug + '/auth',
					slackClientId: slackClientId,
					stripePublishableKey: (req.session.currentUser ? stripePublishableKey : null),
					title: formattedRetreat.name + ' | Mangrove Retreats',
				}))
			})
		})
	}, function (error) { next(error) })
})

router.get('/:slug/auth', function(req, res, next) {
  const slug = req.params.slug;
	auth.checkCode(req.query.code)
	console.log(slug)
	.then(function (slackName) {
		// fetch user details
		return auth.getCurrentUserDetail(slackName)
	})
	.then(function(currentUserDetails) {
		// save user details into session
		req.session.currentUser = currentUserDetails
		// redirect to home
		res.redirect('/' + slug)
	}, function (error) {
		next(error)
	})
})

router.get('/:slug/logout', function(req, res, next) {
  const slug = req.params.slug;
	req.session.currentUser = null
	res.redirect('/' + slug)
})

router.post('/:slug/computeprice', function(req, res, next) {
	price.compute(req.body).then(function (result) {
		res.send(result)
	}, function (err) { next(err) })
})

router.post('/:slug/charge', function(req, res, next) {
	const currentUser = req.session.currentUser
	if (!currentUser) return res.send({
		success: false,
		error: "You need to sign in to perform this action"
	})
	charge.charge(currentUser.username, req.body).then(function () {
		res.send({
			success: true
		})
	}, function (error) {
		res.send({
			success: false,
			error: error
		})
	})
})

router.get('/:slug/booked', function(req, res, next) {
	res.render('booked', {})
})

router.get('/:slug/booking_error', function(req, res, next) {
	res.render('booking_error', {})
})

module.exports = router;
