const stripeSecretKey = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY : 'sk_test_5T8O9RZssCDArs5Qvab937KI'
const stripe = require('stripe')(stripeSecretKey)

const price = require('./price.js')
const participants = require('./participants.js')

function charge(memberAirtableId, params) {
	return new Promise(function (resolve, reject) {
		price.compute(params)
		.then(function (result) {
			if (result.canBook) {
				participants.getParticipantByMemberId(memberAirtableId).then(function (participant) {
					stripe.customers.create({
						email: params.email,
						source: params.tokenId,
						description: (`Member ID: ${memberAirtableId}`),
					}).then(function (customer) {
						const amountInCents = result.price * 100
						stripe.charges.create({
							amount: amountInCents,
							description: result.description,
							currency: "eur",
							customer: customer.id
						}).then(function (charge) {
							participants.add(participant.id, params.retreatId, params.firstNight, params.lastNight).then(function () {
								resolve()
							})
						})
					})
				}, function (error) { reject(error) })
			} else {
				reject('You cannot book this retreat for the desired dates. Week is either full or you chose custom dates.')
			}
		}, function (error) { reject(error) })
	})
}

module.exports = {
	charge: charge
}
