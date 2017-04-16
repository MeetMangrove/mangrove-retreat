function openStripeCheckout(stripeParams, tokenCallback) {
	var handler = StripeCheckout.configure({
		key: stripeParams.key,
		image: '/images/mangrove_logo.png',
		locale: 'auto',
		token: tokenCallback
	})

	// Open Checkout with further options:
	handler.open({
		name: 'Mangrove',
		description: stripeParams.description,
		currency: 'eur',
		amount: stripeParams.amount * 100
	})
}

function postStripeTokenAndInfos(token, retreatId, firstNight, lastNight) {
	$.post('charge', {
		tokenId:token.id,
		email: token.email,
		retreatId: retreatId,
		firstNight: firstNight,
		lastNight: lastNight
	}, function(data) {
		if (data.success) {
			window.location = '/booked'
		} else {
			window.location = '/booking_error?error=' + data
		}
	})
}
