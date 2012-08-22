/**
 * Election configurator
 */
function config_election() {

	var settingsFile = $.getUrlVar('settings');
	
	$.getJSON(settingsFile, function(data) {

		// Get election parameters
		$("#elec_name").html("<b>Election name: </b>" + data.human.name);
		$("#elec_question").html("<b>Question: </b>" + data.human.question);
		$("#elec_0").text(data.human.answer_0);
		$("#elec_1").text(data.human.answer_1);
		
		// Compute election hash
		$.get(settingsFile, function(raw_data) {

			$("#elec_hash").html(
					"<b>Election hash (sha256): </b>"
							+ CryptoJS.SHA256(raw_data));
			
		}, "text");
		
		var g = data.crypto.g.coord;
		// var g1 = data.crypto.g1.coord;
		// var g = data.crypto.g.coord;
		// var g = data.crypto.g.coord;
		G = new ecPoint([ new BigInteger(g[0]), new BigInteger(g[1]) ],
				'curve', 'affine', 'prime', p_u_, false);
		console.log(G.coord[0].toString());
		console.log(G.coord[1].toString());
		
		// Launch precomputing for point multiplication
		// precomputeComb2() //TODO modifier cette methode
		
	});
	
	// Show voting area and hide ballot area
	$("#ballot").hide();
	$("#progress").hide();
	$("#vote").show('slow');
}

/**
 * Controller of the vote application
 */
function start_vote() {

	var settingsFile = $.getUrlVar('settings');
	
	$.getJSON(settingsFile, function(data) {

		var clear_vote = $('input:radio[name=vote]:checked').val();
		if (clear_vote == "1" || clear_vote == "0") {
			
			$("#vote").hide('slow');
			$("#progress").show('slow', function() {

				ballot = prepare_ballot(clear_vote);
				
				// TODO afficher le ballot dans la textarea
				$("#ballot_area").val("The ballot");
				$("#ballot_area").attr('readonly', 'readonly');
				$("#progress").hide('slow');
				$("#ballot").show('slow');
			});
		} else {
			alert("ERROR: Please pick a choice before submitting");
		}
	});
}

// ///////////////////////
// Auxiliary functions //
// ///////////////////////

/**
 * How to get the url parameters ? Function from:
 * http://jquery-howto.blogspot.be/2009/09/get-url-parameters-values-with-jquery.html
 */
$.extend({
	getUrlVars : function() {

		var vars = [], hash;
		var hashes = window.location.href.slice(
				window.location.href.indexOf('?') + 1).split('&');
		for ( var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	getUrlVar : function(name) {

		return $.getUrlVars()[name];
	}
});

// Exemples de code utile pour la suite
// var hash = CryptoJS.SHA256("Message");
