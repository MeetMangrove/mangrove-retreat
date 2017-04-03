var express = require('express');
var router = express.Router();
var participants = require('../middleware/participants.js')


/* GET home page. */
router.get('/', function(req, res, next) {
	participants.get().
	then(
		function (result) {
			res.render('index', result)
		},
		function (err) {
			next(err)
		}
	)
})

module.exports = router;
