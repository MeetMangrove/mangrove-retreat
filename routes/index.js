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

router.get('/', function(req, res, next) {
	retreat.get().then(function (formattedRetreat) {
		participants.get(formattedRetreat.id).then(function (formattedParticipants) {
			faq.get(formattedRetreat.id).then(function (faq) {
				var result = bedsCounter.addBedsCountPerWeek(formattedRetreat, formattedParticipants)
				res.render('index', _.merge(result, {
					participants: formattedParticipants,
					faq: faq,
					slackRedirectUri: slackRedirectUri,
					slackClientId: slackClientId,
					stripePublishableKey: (req.session.currentUser ? stripePublishableKey : null)
				}))
			})
		})
	}, function (error) { next(error) })
})

router.get('/auth', function(req, res, next) {
	auth.checkCode(req.query.code)
	.then(function (slackName) {
		// fetch user details
		return auth.getCurrentUserDetail(slackName)
	})
	.then(function(currentUserDetails) {
		// save user details into session
		req.session.currentUser = currentUserDetails
		// redirect to home
		res.redirect('/')
	}, function (error) {
		next(error)
	})
})

router.get('/logout', function(req, res, next) {
	req.session.currentUser = null
	res.redirect('/')
})

router.post('/computeprice', function(req, res, next) {
	price.compute(req.body).then(function (result) {
		res.send(result)
	}, function (err) { next(err) })
})

router.post('/charge', function(req, res, next) {
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

router.get('/booked', function(req, res, next) {
	res.render('booked', {})
})

router.get('/booking_error', function(req, res, next) {
	res.render('booking_error', {})
})

module.exports = router;
