var express = require('express');
var router = express.Router()

var bedsCounter = require('../helpers/bedsCounter.js')

var participants = require('../middleware/participants.js')
var retreat = require('../middleware/retreat.js')
var price = require('../middleware/price.js')

router.get('/', function(req, res, next) {
	retreat.get().then(function (formattedRetreat) {
		participants.getDetailed().then(function (formattedParticipants) {
			var result = bedsCounter.addBedsCountPerWeek(formattedRetreat, formattedParticipants)
			result.participants = formattedParticipants
			res.render('index', result)
		})
	}, function (error) { next(error) })
})

router.post('/computeprice', function(req, res, next) {
	console.log(req.body)
	price.compute(req.body).then(function (result) {
		res.send(result)
	}, function (err) { next(err) })
})

module.exports = router;
