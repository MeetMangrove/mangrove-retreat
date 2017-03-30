var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
		pricePerNight: 30,
		pricePerWeek: 180,
		weeks: [
			[new Date('June 3, 2017'), new Date('June 4, 2017'), new Date('June 5, 2017'),
				new Date('June 6, 2017'), new Date('June 7, 2017'), new Date('June 8, 2017'),
				new Date('June 9, 2017')],
			[new Date('June 10, 2017'), new Date('June 11, 2017'), new Date('June 12, 2017'),
				new Date('June 13, 2017'), new Date('June 14, 2017'), new Date('June 15, 2017'),
				new Date('June 16, 2017')]
		],
		participants: {
			joe: [new Date('June 3, 2017'), new Date('June 4, 2017'), new Date('June 5, 2017'),
				new Date('June 6, 2017')],
			paul: [new Date('June 3, 2017'), new Date('June 4, 2017'), new Date('June 5, 2017'),
				new Date('June 6, 2017'), new Date('June 7, 2017'), new Date('June 8, 2017'),
				new Date('June 9, 2017')],
			anna: [new Date('June 10, 2017'), new Date('June 11, 2017'), new Date('June 12, 2017'),
				new Date('June 13, 2017'), new Date('June 14, 2017'), new Date('June 15, 2017'),
				new Date('June 16, 2017')],
			fred: [new Date('June 10, 2017'), new Date('June 11, 2017'), new Date('June 12, 2017'),
				new Date('June 13, 2017'), new Date('June 14, 2017'), new Date('June 15, 2017')],
			remi: [new Date('June 10, 2017'), new Date('June 11, 2017'), new Date('June 12, 2017'),
				new Date('June 13, 2017'), new Date('June 14, 2017'), new Date('June 15, 2017'),
				new Date('June 16, 2017')],
			victor: [new Date('June 3, 2017'), new Date('June 4, 2017'), new Date('June 5, 2017'),
				new Date('June 6, 2017'), new Date('June 7, 2017'), new Date('June 8, 2017'),
				new Date('June 9, 2017'), new Date('June 10, 2017'), new Date('June 11, 2017'),
				new Date('June 12, 2017'), new Date('June 13, 2017'), new Date('June 14, 2017'),
				new Date('June 15, 2017'), new Date('June 16, 2017')]
		}
	})
})

module.exports = router;
