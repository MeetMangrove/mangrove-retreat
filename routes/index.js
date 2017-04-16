const express = require('express');
const router = express.Router()
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY ? process.env.STRIPE_PUBLISHABLE_KEY : 'pk_test_BFpNYeuEnZ50FMwhi59JZs2c'
const slackRedirectUri = process.env.SLACK_REDIRECT_URI ? process.env.SLACK_REDIRECT_URI : 'http://localhost:3000/auth'
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
				result.participants = formattedParticipants
				result.faq = faq
				result.slackRedirectUri = slackRedirectUri
				if (typeof req.query.currentUser !== 'undefined') {
					result.stripePublishableKey = stripePublishableKey
					auth.getCurrentUserDetail(req.query.currentUser).then(function (currentUser) {
						result.currentUser = currentUser
						res.render('index', result)
					})
				} else {
					res.render('index', result)
				}
			})
		})
	}, function (error) { next(error) })
})

router.get('/auth', function(req, res, next) {
	auth.checkCode(req.query.code).then(function (currentUser) {
		res.redirect('/?currentUser=' + currentUser)
	}, function (error) {
		next(error)
	})
})

router.post('/computeprice', function(req, res, next) {
	price.compute(req.body).then(function (result) {
		res.send(result)
	}, function (err) { next(err) })
})

router.post('/charge', function(req, res, next) {
	charge.charge(req.body).then(function () {
		res.send({
			success: true
		})
	}, function (error) { next(error)	})
})

router.get('/booked', function(req, res, next) {
	res.render('booked', {})
})

router.get('/booking_error', function(req, res, next) {
	res.render('booking_error', {})
})

module.exports = router;
