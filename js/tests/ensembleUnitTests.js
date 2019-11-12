/*global define */
/**
 * This has all of the unit tests for functions that are from ensemble.js
 */

define(["util", "underscore", "ruleLibrary", "socialRecord", "ensemble", "actionLibrary", "test", "text!data/testSocial.json", "text!data/testVolitionRules.json", "text!data/testActionsGrammar8.json", "text!data/testActionsGrammar9.json"],
function(util, _, ruleLibrary, socialRecord, ensemble, actionLibrary, test, testSocial, testVolitionRules, testActionsGrammar8, testActionsGrammar9) {


	/***************************************************************/
	/* UNIT TESTS */
	/***************************************************************/

	var runTests = function() {
		testLoadSocialStructure();
		testAddRules();
		testCharacters();
	};

	var testLoadSocialStructure = function() {
		var data = {
			"schema": [
				{
					"category": "network",
					"isBoolean": false,
					"defaultValue": 50,
					"directionType": "directed",
					"types": ["affinity", "trust"],
					"actionable": true
				},
				{
					"category": "relationship",
					"isBoolean": true,
					"defaultValue": false,
					"directionType": "reciprocal",
					"types": ["friends", "involved with"],
					"actionable": true
				}
			]
		};
		test.start("ensemble", "loadSocialStructure");
		var structure = ensemble.loadSocialStructure(data);
		test.assert(_.keys(structure).length, 2, "structure should have had two keys");
		test.assert(_.keys(structure.network).length, 2, "network should have had two keys");
		test.assertNEQ(structure.network, undefined , "structure should have key network");
		test.assertNEQ(structure.relationship, undefined, "structure should have key relationship");
		test.assertNEQ(structure.network.affinity, undefined, "structure.network should have key affinity");

		// Try some bad blueprints, make sure they fail.
		var didFail = false;
		var shouldFail = false;
		var testB = util.clone(data);
		try {
			var bad1 = util.clone(testB);
			delete bad1.schema[0].isBoolean;
			shouldFail = loadSocialStructure(bad1);
		} catch(e) {
			didFail = true;
		}
		test.assert(didFail, true, "newFactory was passed a blueprint without isBoolean but didn't crash.");

		didFail = false;
		try {
			var bad2 = util.clone(testB);
			delete bad2.schema[0].defaultValue;
			shouldFail = loadSocialStructure(bad2);
		} catch(e) {
			didFail = true;
		}
		test.assert(didFail, true, "newFactory was passed a numeric blueprint without a defaultValue but didn't crash.");

		didFail = false;
		try {
			var bad3 = util.clone(testB);
			bad3.schema[0].directionType = "nonsense";
			shouldFail = loadSocialStructure(bad3);
		} catch(e) {
			didFail = true;
		}
		test.assert(didFail, true, "newFactory was passed a  blueprint with an invalid directionType but didn't crash.");

		didFail = false;
		try {
			var bad4 = util.clone(testB);
			bad4.schema[0].invalidKey = false;
			shouldFail = loadSocialStructure(bad4);
		} catch(e) {
			didFail = true;
		}
		test.assert(didFail, true, "newFactory was passed a  blueprint with an unexpected key but didn't crash.");

		didFail = false;
		try {
			var bad5 = util.clone(testB);
			bad5.schema[1].types = "shouldBeArray";
			shouldFail = loadSocialStructure(bad5);
		} catch(e) {
			didFail = true;
		}
		test.assert(didFail, true, "newFactory was passed a  blueprint with a non-array 'types' but didn't crash.");

		test.finish();

	};
	
	/**
	 *@method testAddRules
	 *@private
	 *@memberof ensemble
	 *@description A suite of unit tests verifying the functionality of testAddRules
	 */
	var testAddRules = function(){
		ensemble.loadBaseBlueprints(testSocial);
		test.start("ensemble", "testAddRules");
		
		//Let's make a quickie JSON thing
		var triggerData = '{' +
		'"fileName" : "testAddRules (method)",' + 
		'"type": "trigger",' +
		'"rules": [' +
			'{' +
				'"name": "If I am jealous and someone hits on my sweetie, I hate them.",' +
				'"conditions": [' +
					'{' +
						'"category": "relationship",' +
						'"type": "involved with",' +
						'"first": "x",' +
						'"second": "y"' +
					'},{' +
						'"category": "trait",' +
						'"type": "jealous",' +
						'"first": "x"' +
					'},{' +
						'"category": "socialRecordLabel",' +
						'"type": "romanticAdvance",' +
						'"first": "z",' +
						'"second": "y",' +
						'"turnsAgoBetween": ["NOW", "NOW"]' +
					'}' +
				'],' +
				'"effects": [' +
					'{' +
						'"category": "directedStatus",' +
						'"type": "attracted to",' +
						'"first": "x",' +
						'"second": "z",' +
						'"value": true' +
					'}' +
				']' +
			'}'+
		']}';
		
		var volitionData = '{' +
		'"fileName" : "testAddRules (method)",' + 
		'"type": "volition",' +
		'"rules": [' +
			'{' +
				'"name": "If I am jealous and someone hits on my sweetie, I want to lower affinity with them.",' +
				'"conditions": [' +
					'{' +
						'"category": "relationship",' +
						'"type": "involved with",' +
						'"first": "x",' +
						'"second": "y"' +
					'},{' +
						'"category": "trait",' +
						'"type": "jealous",' +
						'"first": "x"' +
					'},{' +
						'"category": "socialRecordLabel",' +
						'"type": "romanticAdvance",' +
						'"first": "z",' +
						'"second": "y",' +
						'"turnsAgoBetween": ["NOW", "NOW"]' +
					'}' +
				'],' +
				'"effects": [' +
					'{' +
						'"category": "network",' +
						'"type": "affinity",' +
						'"first": "x",' +
						'"second": "z",' +
						'"weight": 5,' +
						'"intentType" : false' +
					'}' +
				']' +
			'}'+
		']}';
		
		var userSpecifiedData = '{' +
		'"fileName" : "testAddRules (method)",' + 
		'"type": "FOOBAR",' +
		'"rules": [' +
			'{' +
				'"name": "If I am jealous and someone hits on my sweetie, I want to lower affinity with them.",' +
				'"conditions": [' +
					'{' +
						'"category": "relationship",' +
						'"type": "involved with",' +
						'"first": "x",' +
						'"second": "y"' +
					'},{' +
						'"category": "trait",' +
						'"type": "jealous",' +
						'"first": "x"' +
					'},{' +
						'"category": "socialRecordLabel",' +
						'"type": "romanticAdvance",' +
						'"first": "z",' +
						'"second": "y",' +
						'"turnsAgoBetween": ["NOW", "NOW"]' +
					'}' +
				'],' +
				'"effects": [' +
					'{' +
						'"category": "network",' +
						'"type": "affinity",' +
						'"first": "x",' +
						'"second": "z",' +
						'"weight": 5,' +
						'"intentType" : false' +
					'}' +
				']' +
			'}'+
		']}';

		var intentTypeTest = '{' +
		'"fileName" : "testAddRules (method)",' + 
		'"type": "volition",' +
		'"rules": [' +
			'{' +
				'"name": "If I am jealous and someone hits on my sweetie, I want to lower affinity with them.",' +
				'"conditions": [' +
					'{' +
						'"category": "relationship",' +
						'"type": "involved with",' +
						'"first": "x",' +
						'"second": "y"' +
					'},{' +
						'"category": "trait",' +
						'"type": "jealous",' +
						'"first": "x"' +
					'},{' +
						'"category": "socialRecordLabel",' +
						'"type": "romanticAdvance",' +
						'"first": "z",' +
						'"second": "y",' +
						'"turnsAgoBetween": ["NOW", "NOW"]' +
					'}' +
				'],' +
				'"effects": [' +
					'{' +
						'"category": "network",' +
						'"type": "affinity",' +
						'"first": "x",' +
						'"second": "z",' +
						'"weight": 5,' +
						'"intentType" : "decrease"' +
					'}' +
				']' +
			'}'+
		']}';

		intentTypeTest = JSON.parse(intentTypeTest);
		
		
		
		//TEST 1 -- verify that our ruleLibrary trigger rules starts off empty, and then we can successfully add something to it!
		var triggerRules = ruleLibrary.getTriggerRules();
		test.assert(triggerRules.length, 0, "Apparantly ruleLibrary had a trigger in it already. Wanted to start off with it being empty");
		ensemble.addRules(triggerData);
		triggerRules = ruleLibrary.getTriggerRules();
		test.assert(triggerRules.length, 1, "Trigger rule did not get successfully parsed in, sadly");
		
		//TEST 3 -- same as TEST 1, but for volition rules
		var volitionRules = ruleLibrary.getVolitionRules();
		test.assert(volitionRules.length, 0, "apparantly ruleLibrary had a volition rule in it already. Wanted to start off with it being empty");
		ensemble.addRules(volitionData);
		volitionRules = ruleLibrary.getVolitionRules();
		test.assert(volitionRules.length, 1, "Volition rule did not get successfully parsed in, sadly");
		
		//TEST 5 -- Eh, what happens when we do a user speensembleied set of rules (i.e. NOT trigger nor volition).
		ensemble.addRules(userSpecifiedData);
		volitionRules = ruleLibrary.getVolitionRules();
		triggerRules = ruleLibrary.getTriggerRules();
		test.assert(volitionRules.length, 1, "adding the crazy user specified field affected volition rules in a way that it shouldn't have");
		test.assert(triggerRules.length, 1, "adding the crazy user specified field affected trigger rules in a way that it hsouldn't have");
		
		socialRecord.clearEverything();
		ruleLibrary.clearRuleLibrary();
		//TEST 6 -- What happens when we enter in non standardized values for intentType
		ensemble.addRules(intentTypeTest); // uses "decrease" for a lessen affinity effect
		volitionRules = ruleLibrary.getVolitionRules();
		test.assert(volitionRules.length, 1, "Volition rule with a non-standard intentType was not read in correctly.");
		test.assert(volitionRules[0].effects[0].intentType, false, "Volition rule with a non-standard intentType was not standardized properly");

		//TEST 6.1 -- What happens when we enter in a non standardized value for intentType that mismatches the isBoolean value of the category.
		socialRecord.clearEverything();
		ruleLibrary.clearRuleLibrary();
		intentTypeTest.rules[0].effects[0].intentType = "stop";
		var rejected = false;
		try{
			ensemble.addRules(intentTypeTest);
		} catch (e){
			rejected = true;
		}

		test.assert(rejected, true, "Volition rule with an INCORRECT non-standard intentType was NOT rejected.");

		//TEST 6.2 -- what happens when gibberish is used for intentType
		socialRecord.clearEverything();
		ruleLibrary.clearRuleLibrary();
		intentTypeTest.rules[0].effects[0].intentType = "jbkjdkfjdkfj";
		var rejected = false;
		try{
			ensemble.addRules(intentTypeTest);
		} catch (e){
			rejected = true;
		}

		test.assert(rejected, true, "Volition rule with a gibberish intentType was NOT rejected.");
		
		//TEST 6.3 -- what happens when intentType is 'start' (with a boolean )
		socialRecord.clearEverything();
		ruleLibrary.clearRuleLibrary();
		intentTypeTest.rules[0].effects[0] = util.clone(intentTypeTest.rules[0].conditions[0]);
		intentTypeTest.rules[0].effects[0].intentType = "start";
		intentTypeTest.rules[0].effects[0].weight = 100;
		//var rejected = false;
		//try{

		volitionRules = ruleLibrary.getVolitionRules();
		console.log("$$$$$$$$ Here are all of my volition rules... " , volitionRules);

		ensemble.addRules(intentTypeTest);
		//} catch (e){
		//	rejected = true;
		//}
		volitionRules = ruleLibrary.getVolitionRules();
		console.log("$$$$$$$$ Here are all of my volition rules... " , volitionRules);
		test.assert(volitionRules.length, 1, "blah Volition rule with a non-standard intentType (start) was not read in correctly.");
		test.assert(volitionRules[0].effects[0].intentType, true, "blah Volition rule with a non-standard intentType (start) was not standardized properly");


		test.finish();
	};

	var testCharacters = function() {
		var testChars = {
			"cast": {
				"bob": {
					"name": "Bob"
				},
				"lechuck": {
					"name": "Le Chuck",
					"job": "pirate"
				},
				"anonymous": {
				}
			}
		}
		test.start("ensemble", "testCharacters");
		var chars = ensemble.addCharacters(testChars);
		test.assert(chars.length, 3, "addCharacters should return an array of length 3 with the names of each character.");
		test.assert(chars.indexOf("lechuck") >= 0, true, "Each character in the given object should be present in the array returned from addCharacters.");
		var newChars = ensemble.getCharacters();
		test.assert(newChars.length, 3, "getCharacters should return an array of length 3, just as is returned when we first add the characters.");
		test.assert(ensemble.getCharData("lechuck", "name"), "Le Chuck", "getCharData for name should return the appropriate printed name.")
		test.assert(ensemble.getCharName("lechuck"), "Le Chuck", "getCharName should return the printed name for a character.");
		test.assert(ensemble.getCharName("anonymous"), "anonymous", "getCharName should return the key if no printed name is defined.")
		test.assert(ensemble.getCharData("lechuck", "job"), "pirate", "getCharData should be able to return arbitrary metadata.")
		test.assert(ensemble.getCharData("bob", "job"), undefined, "getCharData should return undefined if a piece of metadata can't be found.");
		test.assert(ensemble.getCharData("unknownChar", "job"), undefined, "getCharData should return undefined if given an invalid character.");

		test.finish();

	};
	

	/***************************************************************/
	/* INTERFACE */
	/***************************************************************/

	var ensembleUnitTestInterface = {
		runTests: runTests
	};

	return ensembleUnitTestInterface;

});