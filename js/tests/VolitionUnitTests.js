/*global define */
/**
 * This has all of the unit tests for functions that are from ensemble.js
 */

define(["ruleLibrary", "socialRecord", "ensemble", "test", "volition"],
function(ruleLibrary, socialRecord, ensemble, test, volition) {


	/***************************************************************/
	/* UNIT TESTS */
	/***************************************************************/

	
	var runTests = function() {
		var sampleVolitions = {
			"simon": {
				"monica": [
					{ "category": "relationship", "type": "involved with", "intentType": true, "weight": 19 },
					{ "category": "network", "type": "buddy", "intentType": true, "weight": 20 }
				]
			},
			"monica": {
				"simon": [
					{ "category": "network", "type": "affinity", "intentType": false, "weight": 12 },
					{ "category": "relationship", "type": "involved with", "intentType": true, "weight": -5 },
					{ "category": "network", "type": "buddy", "intentType": true, "weight": 1 }
				]
			}
		};

		test.start("Volition", "testNewSet");
		var v0 = volition.newSet(["Albert", "Sally", "Jim"]);
		test.assert(v0["Albert"]["Jim"].length, 0, "newSet did not make a proper empty object (1).");
		test.assert(v0["Sally"]["Albert"].length, 0, "newSet did not make a proper empty object (2).");
		test.assert(v0["Jim"]["somebody"], undefined, "newSet did not make a proper empty object (3).");
		test.finish();

		test.start("Volition", "testGetters");
		var v = volition.register("main", sampleVolitions);
		test.assertNEQ(volition.getVolitionCacheByKey("main"), undefined, "volitionCache should get a newly created volition set.");
		test.assert(volition.getAllVolitionsByKeyFromTo("main","simon","monica").length, 2, "volitionCache has whole data set properly loaded.");
		var f = v.getFirst("simon", "monica");
		test.assert(f.weight, 20, "getFirst returns properly sorted volition.", f);
		test.assert(v.getNext("simon", "monica").weight, 19, "getNext returns next volition.");
		test.assert(v.getNext("simon", "monica"), undefined, "getNext returns undefined when it runs out of volitions.");
		test.assert(v.getNext("monica", "simon").weight, 12, "getNext acts like getFirst when called for a pair getFirst hasn't been called for.");
		test.assert(v.getFirst("simon", "monica").weight, 20, "getFirst properly resets itself.");
		test.assert(v.getFirst("simon", "franklin"), undefined, "getFirst returns undefined if no volitions found (1).");
		test.assert(v.getFirst("franklin", "simon"), undefined, "getFirst returns undefined if no volitions found (2).");
		test.finish();

		test.start("Volition", "isAccepted");
		test.assert(volition.isAccepted("main", "simon", "monica", {
			"category": "relationship",
			"type": "involved with",
			"intentType": true}).accepted, false, "A negative weight from responder to initiator should mean the social move is rejected.");
		test.assert(volition.isAccepted("main", "simon", "monica", {
			"category": "network",
			"type": "buddy",
			"intentType": true}).accepted, true, "A positive weight from responder to initiator should mean the social movei is accepted.");
		test.assert(volition.isAccepted("main", "monica", "simon", {
			"category": "network",
			"type": "affinity",
			"intentType": false }).accepted, true, "When the responder has no feelings about the intent, it should succeed (based on acceptIfNoMatch variable)");
		test.finish();



	};


	/***************************************************************/
	/* INTERFACE */
	/***************************************************************/

	var volitionUnitTestInterface = {
		runTests: runTests
	};

	return volitionUnitTestInterface;

});