const _ = require('lodash')
const express = require('express')
const router = express.Router()
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY ? process.env.STRIPE_PUBLISHABLE_KEY : 'pk_test_BFpNYeuEnZ50FMwhi59JZs2c'
const bedsCounter = require('../helpers/bedsCounter.js')

const participants = require('../middleware/participants.js')
const retreat = require('../middleware/retreat.js')
const faq = require('../middleware/faq.js')
const price = require('../middleware/price.js')
const auth = require('../middleware/auth.js')
const charge = require('../middleware/charge.js')

router.get('/', function(req, res, next) {
  // find the "current" retreat and redirect to it
  retreat.getCurrent().then(function(retreat) {
    res.redirect(`/${retreat.slug}`)
  }).catch(function(err) {next(err)})
})

router.get('/auth', function(req, res, next) {
	auth.checkCode(req.query.code)
	.then(function ({slackId}) {
		// fetch user details
		return auth.getMemberBySlackId(slackId)
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

router.get('/:slug', function(req, res, next) {
	const slug = req.params.slug;
	retreat.get(slug).then(function (formattedRetreat) {
		return participants.get(formattedRetreat.id).then(function (formattedParticipants) {
			return faq.get(formattedRetreat.id).then(function (faq) {
				const retreat = bedsCounter.addBedsCountPerWeek(formattedRetreat, formattedParticipants)
				res.render('index', _.merge({}, retreat, {
					participants: formattedParticipants,
					faq: faq,
					stripePublishableKey: (req.session.currentUser ? stripePublishableKey : null),
					title: formattedRetreat.name + ' | Mangrove Retreats',
				}))
			})
		})
	})
  .catch(function (error) { next(error) })
})

router.post('/:slug/computeprice', function(req, res, next) {
	price.compute(req.body).then(function (result) {
		res.send(result)
	}, function (err) { next(err) })
})

router.post('/:slug/charge', function(req, res, next) {
	const currentUser = req.session.currentUser
  console.log("CUR", currentUser)
	if (!currentUser) return res.send({
		success: false,
		error: "You need to sign in to perform this action"
	})
	charge.charge(currentUser.id, req.body).then(function () {
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
