var express = require('express');
var router = express.Router()

var bedsCounter = require('../helpers/bedsCounter.js')

var participants = require('../middleware/participants.js')
var retreat = require('../middleware/retreat.js')
var price = require('../middleware/price.js')
var auth = require('../middleware/auth.js')

router.get('/', function(req, res, next) {
	retreat.get().then(function (formattedRetreat) {
		participants.get(formattedRetreat.id).then(function (formattedParticipants) {
			var result = bedsCounter.addBedsCountPerWeek(formattedRetreat, formattedParticipants)
			result.participants = formattedParticipants
			res.render('index', result)
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

module.exports = router;
