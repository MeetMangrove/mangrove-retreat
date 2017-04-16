$('.user-avatar').on('click', function(e) {
  $('.navbar-dropdown-menu').toggleClass('is-active')
  e.stopPropagation();
})

$('body').on('click', function() {
  $('.navbar-dropdown-menu').removeClass('is-active')
})

var organiserUsername = $('#retreat_organizer_username').val()
var stripeParams = {
	key: config.stripePublishableKey,
	amount: 2000,
	description: 'Retreat'
}

$('.booking-board-row').on('click', function(){
	$(this).toggleClass('is-active')
})

$('.booking-board-footer.step-1 .booking-board-btn').on('click', function(){
	$(this).unbind('click')

	var selectedDaysIds = $(this).data('days').split(' ').slice(0, -1)
	computePrice($(this), selectedDaysIds)
	var firstDaySelected = false
	var lastDaySelected = false
	$(this).addClass('is-active')
	$(this).find('span').html('Pay $200')
	$('.booking-board-footer').removeClass('step-1').addClass('step-2')
	for (var i = 0, len = selectedDaysIds.length; i < len; i++) {
		$('#' + selectedDaysIds[i]).addClass('is-active')
	}

	var divs = $('.booking-board-days-selector .day-item.is-active')
	var index = 0;

	var delay = setInterval( function(){
		if ( index <= divs.length ){
			$( divs[ index ] ).addClass( 'is-visible' );
			index += 1;
		}else{
			clearInterval( delay );
		}
	}, i * 2);

	$('.booking-board-days-selector .day-item').on('click', function() {
		if (lastDaySelected) {
			$('.booking-board-days-selector .day-item').removeClass('is-active')
		}
		if($('.booking-board-days-selector .day-item').hasClass('is-active')) {
			var divs = []

			 if($('.booking-board-days-selector .day-item.is-active').attr('id') == $(this).attr('id')) return

			 selectedDaysIds = [];
			 selectedDaysIds.push($(this).attr('id'))
			 selectedDaysIds.push($('.booking-board-days-selector .day-item.is-active').attr('id'))

			 if(isBefore($('.booking-board-days-selector .day-item.is-active'), $(this))) {
				divs = $(this).prevUntil($('.booking-board-days-selector .day-item.is-active')).addClass('is-active is-visible')
			 } else {
				divs = $(this).nextUntil($('.booking-board-days-selector .day-item.is-active')).addClass('is-active is-visible')
			 }
			 for (var i = 0, len = divs.length; i < len; i++) {
				 selectedDaysIds.push(divs[i].getAttribute('id'))
			 }
			 $(this).addClass('is-active  is-visible')

			 lastDaySelected = true
			 firstDaySelected = false
			 computePrice($('.booking-board-btn.is-active'), selectedDaysIds)
		} else {
			$(this).addClass('is-active is-visible')
			firstDaySelected = true
			lastDaySelected = false
		}

	})

	$('.booking-board-days-selector').on('mouseenter', function() {
		if(!firstDaySelected) {
			$('.booking-board-days-selector .day-item').removeClass('is-active')
		}
	}).mouseleave(function(){
		if(!firstDaySelected) {
			lastDaySelected = false

			$('.booking-board-days-selector .day-item').removeClass('is-active')
			for (var i = 0, len = selectedDaysIds.length; i < len; i++) {
				$('#' + selectedDaysIds[i]).addClass('is-active is-visible')
			}

		}
	})

	$(this).on('click', function() {
		if($(this).hasClass('can-book')) {
			openStripeCheckout(stripeParams, function(token) {
				selectedDays = datify(selectedDaysIds)
				postStripeTokenAndInfos(token, config.retreatId, selectedDays[0], selectedDays[selectedDays.length - 1])
			})
		} else {
			// 👦 need le slack id du retreat organiser, dynamiquement (ci dessous @ben en brut: U1NK4E3QE)
			window.open('slack://user?team=T0QJH8NJK&id=U1NK4E3QE')
		}
	})
})

function computePrice(that, selectedDays) {
	that.addClass('is-loading')
	$('.booking-board-footer-title').addClass('is-loading')

	selectedDays = datify(selectedDays)

	$.post('computeprice',
		{ retreatId: config.retreatId,
			firstNight: selectedDays[0],
			lastNight:  selectedDays[selectedDays.length - 1]
		}, function(data){
			that.removeClass('is-loading')
			$('.booking-board-footer-title').removeClass('is-loading')

			stripeParams.amount = data.price
			stripeParams.description = data.description
			var text
			if(data.canBook) {
				text = 'Pay ' + data.price + "€"
				that.addClass('can-book')
				that.removeClass('redirect-to-slack')
			} else {
				text = "DM " + organiserUsername
				that.removeClass('can-book')
				that.addClass('redirect-to-slack')

			}
			that.find('span').text(text)
			$('.booking-board-footer-title .data-item-header').html(data.price + '€')
			$('.booking-board-footer-title .data-item-footer').html(selectedDays.length + ' nights')
	})
}

function datify(array) {
	array = array.map(function(item, i) {
		return $('#' + item).data('date')
	})

	array = array.sort(function(a,b) {
		return new Date(a).getTime() - new Date(b).getTime()
	});


	return array

}

function isBefore(el1, el2) {
	return el1.nextAll().filter(el2).length !== 0;
}

var touch = 'ontouchstart' in document.documentElement
						|| navigator.maxTouchPoints > 0
						|| navigator.msMaxTouchPoints > 0;

if (touch) { // remove all :hover stylesheets
		try { // prevent exception on browsers not supporting DOM styleSheets properly
				for (var si in document.styleSheets) {
						var styleSheet = document.styleSheets[si];
						if (!styleSheet.rules) continue;

						for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
								if (!styleSheet.rules[ri].selectorText) continue;

								if (styleSheet.rules[ri].selectorText.match(':hover')) {
										styleSheet.deleteRule(ri);
								}
						}
				}
		} catch (ex) {}
}
var ink, d, x, y;
$(".ripplelink").click(function(e){
	if($(this).find(".ink").length === 0){
			$(this).prepend("<span class='ink'></span>");
	}

	ink = $(this).find(".ink");
	ink.removeClass("animate");

	if(!ink.height() && !ink.width()){
			d = Math.max($(this).outerWidth(), $(this).outerHeight());
			ink.css({height: d, width: d});
	}

	x = e.pageX - $(this).offset().left - ink.width()/2;
	y = e.pageY - $(this).offset().top - ink.height()/2;

	ink.css({top: y+'px', left: x+'px'}).addClass("animate");
})
