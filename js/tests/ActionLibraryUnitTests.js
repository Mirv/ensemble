/*global define */
/**
 * This has all of the unit tests for functions that are from ActionLibrary.js
 */

define(["util", "underscore", "ruleLibrary", "actionLibrary", "socialRecord", "ensemble", "test", "volition", "text!data/testVolitionRules.json", "text!data/testSocial.json", "text!data/testActions.json", "text!data/testActionsGrammar.json", "text!data/testActionsGrammar2.json", "text!data/testActionsGrammar3.json", "text!data/testActionsGrammar4.json", "text!data/testActionsGrammar5.json", "text!data/testActionsGrammar6.json", "text!data/testActionsGrammar7.json", "text!data/testActionsGrammar8.json", "text!data/testActionsGrammar9.json", "text!data/testActionsGrammar10.json", "text!data/testActionsGrammar11.json", "text!data/testActionsGrammar12.json", "text!data/testActionsGrammar13.json", "text!data/samsVolition.json", "text!data/rpgSchema.json", "text!data/rpgActions.json", "text!data/testActionsGrammar14.json", "text!data/testActionsGrammar15.json", "text!data/testActionsGrammar16.json", "text!data/testActionsGrammar17.json"],
function(util, _, ruleLibrary, actionLibrary, socialRecord, ensemble, test, volition, testVolitionRules, testSocial, testActions, testActionsGrammar, testActionsGrammar2, testActionsGrammar3, testActionsGrammar4, testActionsGrammar5, testActionsGrammar6, testActionsGrammar7, testActionsGrammar8, testActionsGrammar9, testActionsGrammar10, testActionsGrammar11, testActionsGrammar12, testActionsGrammar13, samsVolition, rpgSchema, rpgActions, testActionsGrammar14, testActionsGrammar15, testActionsGrammar16, testActionsGrammar17) {


	/***************************************************************/
	/* UNIT TESTS */
	/***************************************************************/

	
	var runTests = function() {


		socialRecord.clearEverything();
		testParseActions();
		socialRecord.clearEverything();
		socialRecord.clearEverything();
		testGetActionFromName();
		socialRecord.clearEverything();
		//testDoAction();
		socialRecord.clearEverything();
		//testBindActionEffects();
		socialRecord.clearEverything();
		testCategorizeActionGrammar();
		socialRecord.clearEverything();
		testGetTerminalsFromNonTerminal();
		socialRecord.clearEverything();
		testGetActionHierarchyFromVolition();
		socialRecord.clearEverything();
		testActionsWithConditions();
		socialRecord.clearEverything();
		testActionsWithInfluenceRules();
		socialRecord.clearEverything();
		testReadingActionsFromMultipleFiles();
		socialRecord.clearEverything();
		testGetAction();
		socialRecord.clearEverything();
		testGetActions();
		socialRecord.clearEverything();
		testUndirectedActions();
		socialRecord.clearEverything();
		testStartSymbolAlreadyExists();
		//socialRecord.clearEverything();


	};

	var testParseActions = function(){
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActions);
		var actions = actionLibrary.getAllActions();

		test.start("ActionLibrary", "testParseActions");
		test.assert(actions.length, 5, "Number of actions parsed in is incorrect.");

		var action1 = actions[0];
		test.assert(action1.name, "reminisce", "Name property of action not parsed correctly");
		test.assert(action1.fileName, "testActions.json", "The stored origin name of the file the action came from is incorrect.");
		var action1Intent = action1.intent;
		test.assert(action1Intent.category, "network", "category of intent not parsed correctly");
		test.assert(action1Intent.type, "affinity", "type of intent not parsed correctly");
		test.assert(action1Intent.first, "x", "first of intent not parsed correctly");
		test.assert(action1Intent.second, "y", "second of intent not parsed correctly");
		var action1Condition = action1.condition;
		test.assert(action1Condition, undefined, "The first action shouldn't have had a condition");
		var acceptEffects = action1.acceptEffects[0];
		test.assert(acceptEffects.category, "network", "the category of the accept effects wasn't parsed in correctly.");
		test.assert(acceptEffects.type, "affinity", "the type of the acceptEffects wasn't parsed correctly.");
		test.assert(acceptEffects.first, "y", "the first of the accept Effects wasn't parsed in correctly.");
		test.assert(acceptEffects.second, "x", "the second of th accept effects wasn't parsed in correctly.");
		test.assert(acceptEffects.operator, "+", "The operator of the accept effects wasn't parsed in correctly.");
		test.assert(acceptEffects.value, 10, "The Value of the acceptEffects wasn't parsed in correctly.");

		test.finish();
	};

	

	var testGetActionFromName = function(){
		test.start("ActionLibrary", "testGetActionFromName");

		var reminisceAction = actionLibrary.getActionFromName("reminisce");
		
		test.assert(reminisceAction.name, "reminisce", "successfully retrieved the correct action");
		var action1Intent = reminisceAction.intent;
		test.assert(action1Intent.category, "network", "category of intent not parsed correctly");
		test.assert(action1Intent.type, "affinity", "type of intent not parsed correctly");
		test.assert(action1Intent.first, "x", "first of intent not parsed correctly");
		test.assert(action1Intent.second, "y", "second of intent not parsed correctly");
		var action1Condition = reminisceAction.condition;
		test.assert(action1Condition, undefined, "The first action shouldn't have had a condition");

		var fakeAction = actionLibrary.getActionFromName("NotAnAction");
		test.assert(fakeAction, undefined, "Searching for something that isn't an action should have returned undefined, but it didn't");

		test.finish();
	};

	var testDoAction = function(){
		ensemble.loadBaseBlueprints(testSocial);
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActions);
		var sampleVolitions = {
			"simon": {
				"monica": [
					{ "category": "relationship", "type": "involved with", "intentType": true, "weight": 19 },
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 20 }
				]
			},
			"monica": {
				"simon": [
					{ "category": "network", "type": "affinity", "intentType": false, "weight": -12 },
					{ "category": "relationship", "type": "involved with", "intentType": true, "weight": -5 },
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 981 }
				]
			}
		};

		var affinityPredicate = {
			"category" : "network",
			"type" : "affinity",
			"first" : "monica",
			"second" : "simon",
			"value" : 60
		};
		var affinityPredicate2 = {
			"category" : "network",
			"type" : "affinity",
			"first" : "monica",
			"second" : "simon",
			"value" : 49
		};
		var genericAffinityPredicate = {
			"category" : "network",
			"type" : "affinity",
			"first" : "monica",
			"second" : "simon"
		};

		test.start("ActionLibrary", "testGetActionFromName");
		ensemble.setupNextTimeStep(0);
		var v = volition.register("main", sampleVolitions);

		//TEST 1 -- An Accepted Action
		//BEN: This is broken, because you commented out the 'ensemble.set' inside of ActionLibrary (due to circular dependencies.)
		//You probably don't actually need this anymore, so I'm going to comment out the call to this unit test for now.
		//However, when we have our new "doAction" that we need to define, maybe we'll revisit this for inspiration?
		actionLibrary.doAction("reminisce", "simon", "monica", v);
		//var result = ensemble.get(affinityPredicate);
		var result = ensemble.get(genericAffinityPredicate);

		test.assert(result.length, 1, "Simon reminiscing towards Monica didn't appear to change monica's affinity for Simon as it should have.");
		console.log("Everything about the result: " ,  result);

		//TESt 2 -- A Rejected Action
		ensemble.loadBaseBlueprints(testSocial);
		ensemble.setupNextTimeStep(0);
		v = volition.register("main", sampleVolitions);
		actionLibrary.doAction("annoy", "simon", "monica", v);
		console.log(socialRecord.socialRecordFullHistoryToString());
		result = ensemble.get(affinityPredicate2);
		test.assert(result.length, 1, "Annoy was rejected -- instead of going down by 10 should have only gone down by 1!");
		

		test.finish();
	};

	var testBindActionEffects = function(){
		var action = actionLibrary.getActionFromName("reminisce");
		var boundAction = actionLibrary.bindActionEffects("simon", "monica", action);
		var boundAcceptEffects = boundAction.acceptEffects;
		var boundRejectEffects = boundAction.rejectEffects;
		var boundAcceptEffect = boundAcceptEffects[0];
		var boundRejectEffect = boundRejectEffects[0];

		test.start("ActionLibrary", "testBindActionEffects");

		test.assert(boundAcceptEffect.first, "monica", "Monica should be first in the accept!");
		test.assert(boundAcceptEffect.second, "simon", "Simon should be second in the accept!");

		test.assert(boundRejectEffect.first, "monica", "Monica should be first in the reject!");
		test.assert(boundRejectEffect.second, "simon", "Simon should be second in the reject!");

		test.finish();
	};

	var testCategorizeActionGrammar = function(){
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar);
		var actions = actionLibrary.getAllActions();
		//actionLibrary.categorizeActionGrammar(actions);
		var startSymbols = actionLibrary.getStartSymbols();
		var nonTerminals = actionLibrary.getNonTerminals();
		var terminalActions = actionLibrary.getTerminalActions();

		/*
		console.log("start symbols: " , startSymbols);
		console.log("non terminals: " , nonTerminals);
		console.log("terminalActions" , terminalActions);
		*/
	
		test.start("ActionLibrary" , "testCategorizeGrammar");

		test.assert(startSymbols.length, 1, "Incorrect number of startSymbols found");
		test.assert(nonTerminals.length, 3, "Incorrect number of nonTerminals found");
		test.assert(terminalActions.length, 7, "Incorrect number of terminal actions found");

		test.finish();
	};

	var testGetTerminalsFromNonTerminal = function(){
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar);
		var actions = actionLibrary.getAllActions();
		actionLibrary.categorizeActionGrammar(actions);
		var nonTerminals = actionLibrary.getNonTerminals();

		test.start("ActionLibrary" , "getTerminalsfromNonT");

		var cast = ["Klint", "Otis"];
		var uniqueBindings = {
			"initiator" : "Klint",
			"responder" : "Otis"
		};

		for(var i = 0; i < nonTerminals.length; i += 1){
			nonTerminals[i].goodBindings = [];
			nonTerminals[i].goodBindings.push({
				"initiator" : "Klint",
				"responder" : "Otis"
			});
		}


		//Let's see what happens when we try to grab all of the terminalActions!
		//TEST 1 -- starting from the root (accept)
		var acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[0], true, 100, uniqueBindings, cast);
		//console.log("Did I get the terminal actions okay? " , acceptTerminalActions);
		test.assert(acceptTerminalActions.length, 3, "Incorrect number of top level actions (TEST 1)");
		test.assert(acceptTerminalActions[0].name, "ASKOUT", "Wrong name for first terminal action (TEST 1)");
		test.assert(acceptTerminalActions[2].name, "topTerminal", "Wrong name for second terminal action (TEST 1)");
		test.assert(acceptTerminalActions[1].name, "PICKUPLINE", "Wrong name for third terminal action (TEST 1)");
		test.assert(acceptTerminalActions[0].actions.length, 1, "Incorrect number of ASKOUT actions found when starting from startSymbol");
		test.assert(acceptTerminalActions[1].actions.length, 1, "Incorrect number of PICKUPLINE actions found when starting from startSymbol");
	
		//TEST 2 -- starting from "ASKOUT" (accept)
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[1], true, 100, uniqueBindings, cast);
		//console.log("Did I get the terminal actions okay? " , acceptTerminalActions);
		test.assert(acceptTerminalActions.length, 1, "Incorrect number of ASKOUT actions actions (TEST 2)");
		test.assert(acceptTerminalActions[0].name, "askout1-genericAccept", "Wrong name for first terminal action (TEST 2)");


		//TEST 2.5-- starting from "PICKUPLINE" (technically the same as TEST 2, but just being thorough) (accept)
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[2], true, 100, uniqueBindings, cast);
		//console.log("Did I get the terminal actions okay? " , acceptTerminalActions);
		test.assert(acceptTerminalActions.length, 1, "Incorrect number of PICKUPLINE actions actions (TEST 2.5)");
		test.assert(acceptTerminalActions[0].name, "pickupline1", "Wrong name for first terminal action (TEST 2.5)");

		//TEST 3 -- Starting at STARTSYMBOL, but for reject.
		var rejectTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[0], false, 100, uniqueBindings, cast);
		//console.log("Did I get the terminal actions okay? " , rejectTerminalActions);
		test.assert(rejectTerminalActions.length, 2, "Incorrect number of top level actions (TEST 3)");
		test.assert(rejectTerminalActions[0].name, "ASKOUT", "Wrong name for first terminal action (TEST 3)");
		//test.assert(rejectTerminalActions[2].name, "STARTDATING", "Wrong name for second terminal action (TEST 3)");
		test.assert(rejectTerminalActions[1].name, "PICKUPLINE", "Wrong name for third terminal action (TEST 3)");

		test.assert(rejectTerminalActions[0].actions.length, 2, "Incorrect number of REJECTED ASKOUT actions found when starting from startSymbol");
		//test.assert(rejectTerminalActions[2].length, 0, "Incorrect number of REJECTED top-level-terminal actions found when starting from startSymbol");
		test.assert(rejectTerminalActions[1].actions.length, 2, "Incorrect number of REJECTED PICKUPLINE actions found when starting from startSymbol");
	
		//TEST 4 -- Starting at "ASKOUT" but for reject
		rejectTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[1], false, 100, uniqueBindings, cast);
		//console.log("Did I get the terminal actions okay? " , rejectTerminalActions);
		test.assert(rejectTerminalActions.length, 2, "Incorrect number of top level actions (TEST 4)");
		test.assert(rejectTerminalActions[0].name, "askout2-genericReject", "Wrong name for first terminal action (TEST 4)");

		test.assert(rejectTerminalActions.length, 2, "Incorrect number of REJECT ASKOUT actions found when starting from ASKOUT");

		//TEST 4.5 -- Starting at PICKUPLINE but for reject
		rejectTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[2], false, 100, uniqueBindings, cast);
		//console.log("Did I get the terminal actions okay? " , rejectTerminalActions);
		test.assert(rejectTerminalActions.length, 2, "Incorrect number of top level actions (TEST 4.5)");
		test.assert(rejectTerminalActions[0].name, "pickupline3", "Wrong name for first terminal action (TEST 4.5)");
		test.assert(rejectTerminalActions[1].name, "pickupline2", "Incorrect name of second terminal action when starting from  PICKUPLINE (TEST 4.5)");

		//Great, by this point I think it is safe to say we've tested the basic functionality just fine, it can get terminals
		//and sort them based on if they are accepted or rejected.
		//But what about if we, say, only want the MOST salient thing? can we do it?
		
		//TODO: I can already envision a world where if you ask for the most saient "start dating" it actually drills down 
		//all possible branches and gets you only ONE action (i.e. the cream of the crop from pickupline, askout, and startDating)
		//TEST 5 -- get the most salient STARTDATING ACCEPT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[0], true, 1, uniqueBindings, cast);
		test.assert(acceptTerminalActions.length, 3, "Incorrect number of top level actions (TEST 5)");
		test.assert(acceptTerminalActions[2].name, "topTerminal", "Wrong name for top terminal action (TEST 5)");
		//test.assert(acceptTerminalActions[2].length, 1, "When asking for most salient accept START DATING (i.e. top terminal), length was wrong");
		test.assert(acceptTerminalActions[2].salience, 10, "When asking for most salient accept START DATING (i.e. top terminal), salience was wrong");
	
		//TEST 5.5 -- get the most salience STARTDATING REJECT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[0], false, 1, uniqueBindings, cast);
		//test.assert(acceptTerminalActions[2].length, 0, "When asking for most salient reject START DATING (i.e. top terminal), length was wrong");

		//TEST 6 -- get the most salient ASKOUT ACCEPT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[1], true, 1, uniqueBindings, cast);
		test.assert(acceptTerminalActions.length, 1, "Incorrect number of top level actions (TEST 6)");
		test.assert(acceptTerminalActions[0].name, "askout1-genericAccept", "Wrong name for first terminal action (TEST 6)");
		test.assert(acceptTerminalActions[0].salience, 0, "When asking for most salient accept ASKOUT, salience was wrong");
		
		//TEST 6.5 -- get the most salient ASKOUT REJECT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[1], false, 1, uniqueBindings, cast);

		test.assert(acceptTerminalActions.length, 1, "Incorrect number of top level actions (TEST 6.5)");
		test.assert(acceptTerminalActions[0].salience, 50, "When asking for most salient reject ASKOUT, salience was wrong");
		test.assert(acceptTerminalActions[0].name, "askout2-genericReject", "When asking for most salient reject ASKOUT, name was wrong");

		//TEST 7 -- get the most salient PICKUPLINE ACCEPT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[2], true, 1, uniqueBindings, cast);

		test.assert(acceptTerminalActions.length, 1, "Incorrect number of top level actions (TEST 7)");
		test.assert(acceptTerminalActions[0].salience, 0, "When asking for most salient accept PICKUPLINE, salience was wrong");
		test.assert(acceptTerminalActions[0].name, "pickupline1", "When asking for most salient accept PICKUPLINE, name was wrong");

		//TEST 7.5 -- get the most salient PICKUPLINE REJECT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[2], false, 1, uniqueBindings, cast);

		test.assert(acceptTerminalActions.length, 1, "Incorrect number of top level actions (TEST 7.5)");
		test.assert(acceptTerminalActions[0].salience, 70, "When asking for most salient reject PICKUPLINE, salience was wrong");
		test.assert(acceptTerminalActions[0].name, "pickupline3", "When asking for most salient reject PICKUPLINE, name was wrong");

		//TEST 8B -- we want to make sure that even when we are looking for multiple actions, the ordering of the salience is correct.
		//We can do that by just using the above tests again, but by passing in '2' for the action group.
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[0], true, 2, uniqueBindings, cast);

		test.assert(acceptTerminalActions.length, 3, "Incorrect number of top level actions (TEST 8B)");
		test.assert(acceptTerminalActions[2].salience, 10, "(B) When asking for most salient accept START DATING, salience was wrong");
		test.assert(acceptTerminalActions[2].name, "topTerminal", "(B) When asking for most salient accept START DATING, name was wrong");
	
		//TEST 5.5B -- get the most salience STARTDATING REJECT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[0], false, 2, uniqueBindings, cast);
		//test.assert(acceptTerminalActions[2].length, 0, "(B) When asking for most salient reject START DATING, length was wrong");

		//TEST 6B -- get the most salient ASKOUT ACCEPT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[1], true, 2, uniqueBindings, cast);
		test.assert(acceptTerminalActions.length, 1, "(B) When asking for most salient accept ASKOUT, length was wrong");
		test.assert(acceptTerminalActions[0].salience, 0, "(B) When asking for most salient accept ASKOUT, salience was wrong");
		test.assert(acceptTerminalActions[0].name, "askout1-genericAccept", "(B) When asking for most salient accept ASKOUT, name was wrong");

		//TEST 6.5B -- get the most salient ASKOUT REJECT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[1], false, 2, uniqueBindings, cast);
		test.assert(acceptTerminalActions.length, 2, "(B) When asking for most salient reject ASKOUT, length was wrong");
		test.assert(acceptTerminalActions[0].salience, 50, "(B) When asking for most salient reject ASKOUT, salience was wrong");
		test.assert(acceptTerminalActions[0].name, "askout2-genericReject", "(B) When asking for most salient reject ASKOUT, name was wrong");

		//TEST 7B -- get the most salient PICKUPLINE ACCEPT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[2], true, 2, uniqueBindings, cast);
		test.assert(acceptTerminalActions.length, 1, "(B) When asking for most salient accept PICKUPLINE, length was wrong");
		test.assert(acceptTerminalActions[0].salience, 0, "(B) When asking for most salient accept PICKUPLINE, salience was wrong");
		test.assert(acceptTerminalActions[0].name, "pickupline1", "(B) When asking for most salient accept PICKUPLINE, name was wrong");

		//TEST 7.5B -- get the most salient PICKUPLINE REJECT
		acceptTerminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[2], false, 2, uniqueBindings, cast);
		test.assert(acceptTerminalActions.length, 2, "(B) When asking for most salient reject PICKUPLINE, length was wrong");
		test.assert(acceptTerminalActions[0].salience, 70, "(B) When asking for most salient reject PICKUPLINE, salience was wrong");
		test.assert(acceptTerminalActions[0].name, "pickupline3", "(B) When asking for most salient reject PICKUPLINE, name was wrong");


/*
		test.assert(terminalActions.length, 5, "Using the top level non-terminal action returned the incorrect number of terminal actions");

		terminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[1]);
		console.log("Did I get the terminal actions okay (askout)? " , terminalActions);
		test.assert(terminalActions.length, 2, "Using the 'askout' nonterminal returned the incorrect number of terminal actions");
	
		terminalActions = actionLibrary.getActionHierarchyFromNonTerminal(nonTerminals[2]);
		console.log("Did I get the terminal actions okay? (pickupline)" , terminalActions);
		test.assert(terminalActions.length, 2, "Using the 'pickup line' nonterminal returned the incorrect number of terminal actions");
*/


		test.finish();

	};

	var testGetActionHierarchyFromVolition = function(){
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar);
		var actions = actionLibrary.getAllActions();
		var nonTerminals = actionLibrary.getNonTerminals();

		var sampleVolitions = {
			"simon": {
				"monica": [
					{ "category": "relationship", "type": "involved with", "intentType": true, "weight": 30 },
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 20 }
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

		var v = volition.register("main", sampleVolitions);
		var firstVolition = v.getFirst("simon", "monica");
		var isAccepted = v.isAccepted("simon", "monica", firstVolition);
		var weight = firstVolition.weight;
		//var potentialActions = actionLibrary.getActionHierarchyFromVolition(firstVolition, isAccepted, 1);
		var potentialActions = actionLibrary.getActionHierarchyFromVolition("simon", "monica", firstVolition, isAccepted.accepted, weight, 1);


		//console.log("So, how are our potential actions looking? " , potentialActions);

		test.start("ActionLibrary", "getTermActionsFromVol");

		//TEST 1 -- Simon to Monica gets rejected ("most salient")
		test.assert(potentialActions.length, 2, "Length of potential actions is wrong.");
		test.assert(potentialActions[0].name, "ASKOUT", "name of first action is wrong");
		test.assert(potentialActions[1].name, "PICKUPLINE", "name of second action is wrong");
		//test.assert(potentialActions[2].name, "STARTDATING", "name of third action is wrong");
		//test.assert(potentialActions[2].length, 0, "Start Dating (simon to monica, rejected) length was wrong");
		test.assert(potentialActions[0].actions.length, 1, "Ask Out (simon to monica, rejected) length was wrong");
		test.assert(potentialActions[0].actions[0].name, "askout2-genericReject", "askout (simon to monica, rejected) name was wrong");
		test.assert(potentialActions[1].actions.length, 1, "Pickupline (simon to monica, rejected) length was wrong");
		test.assert(potentialActions[1].actions[0].name, "pickupline3", "Pickupline (simon to monica, rejected) name was wrong");


		test.finish();
	};

	var testActionsWithConditions = function(){
		//console.log("*******************");
		//console.log("*******************");
		//console.log("*******************");
		ensemble.loadBaseBlueprints(testSocial);
		actionLibrary.clearActionLibrary();

		//Simple situation: We want binding for two people who are nimble and who are friends with each other.
		//Bob, Alice and Scott will be 'nimble'
		//Bob and Alice will be friends with each other.
		//Scott and Biff will be friends with each other.
		//So the only valid combinations will be Bob for nimble1, Alice for nimble2, OR vice versa.
		//MisterInit and MadamRespond are just the placeholders -- they'll be the initiator and responder (who are automatically bound to the initiator and responder roles).
		//So, let's set this up in the socialRecord.
		var cast = ["Bob", "Alice", "Scott", "Biff", "MisterInit", "MadamRespond", "ThePrinceOfNothing"];

		var sampleVolitions = {
			"MisterInit": {
				"MadamRespond": [
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 60 }
				]
			},
			"MadamRespond": {
				"MisterInit": [
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 60 }
				]
			},
		};

		//var nimble1 -- bob is nimble
		var nimble1Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Bob",
			"value" : true
		};
		//var nimble2 -- Alice is nimble
		var nimble2Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Alice",
			"value" : true
		};
		//var nimble3 -- Scott is nimble
		var nimble3Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Scott",
			"value" : true
		};

		//friends1 -- Bob and Alice are friends
		var friends1Pred = {
			"category" : "relationship",
			"type" : "friends",
			"first" : "Bob",
			"second" : "Alice",
			"value" : true
		};
		//friends2 -- Scott and Biff are friends
		var friends2Pred = {
			"category" : "relationship",
			"type" : "friends",
			"first" : "Scott",
			"second" : "Biff",
			"value" : true
		};
		//lucky1  -- Biff is lucky
		var lucky1Pred = {
			"category" : "trait",
			"type" : "lucky",
			"first" : "Biff",
			"value" : true
		};
		//happy1 -- Alice is happy (THIS SHOULD MAKE IT SO THAT THE ONLY VALID COMBINATION IS THAT ALICE IS NIMBLE 1)
		var happy1Pred = {
			"category" : "status",
			"type" : "happy",
			"first" : "Alice",
			"vlaue" : true
		};
		//happy2 -- Scott is happy
		var happy2Pred = {
			"category" : "status",
			"type" : "happy",
			"first" : "Scott",
			"vlaue" : true
		};

		ensemble.set(nimble1Pred);
		ensemble.set(nimble2Pred);
		ensemble.set(nimble3Pred);
		ensemble.set(friends1Pred);
		ensemble.set(friends2Pred);
		ensemble.set(lucky1Pred);
		ensemble.set(happy1Pred);
		ensemble.set(happy2Pred);

		var v = volition.register("main", sampleVolitions);
		var firstVolition = v.getFirst("MisterInit", "MadamRespond");
		var isAccepted = v.isAccepted("MisterInit", "MadamRespond", firstVolition);
		var weight = firstVolition.weight;

		test.start("ActionLibrary", "testActionsWithConditions" );

		//TEST 1 -- Using testActionsGrammar2 
		//(initiator and responder need to have mutual friend -- none exist)
		//This means that generic accept should be returened.
		
		actionLibrary.parseActions(testActionsGrammar2);
		var potentialActions = actionLibrary.getActionHierarchyFromVolition("MisterInit", "MadamRespond", firstVolition, isAccepted.accept, weight, 1, cast);
		var reminisceActions = potentialActions[0].actions;
		var jokeActions = potentialActions[1].actions;

		test.assert(_.keys(potentialActions).length, 2, "Wrong number of action groups!");
		test.assert(reminisceActions.length, 1, "Wrong number of reminisceActions!");
		test.assert(jokeActions.length, 1, "Wrong number of jokeActions!");

		var joke = jokeActions[0];
		var reminisce = reminisceActions[0];

		test.assert(joke.name, "telljoke1", "name is wrong for joke action");
		test.assert(joke.isAccept, true, "isAccept is wrong for joke action");
		test.assert(joke.salience, 60, "salience is wrong for joke action"); // salience is 60 because of initial volition
		test.assert(joke.effects.length, 1, "length of jokes effects is incorrect");
		test.assert(_.keys(joke.conditions).length, 0, "wrong number of conditions for joke action");

		test.assert(reminisce.name, "reminisce1", "name is wrong for reminisce action");
		test.assert(reminisce.isAccept, true, "isAccept is wrong for reminisce action");
		test.assert(reminisce.salience, 60, "salience is wrong for reminisce action"); // salience is 60 because of initial volition
		test.assert(reminisce.effects.length, 1, "length of reminisce effects is incorrect");
		test.assert(_.keys(reminisce.conditions).length, 0, "wrong number of conditions for reminisce action");

		//TEST 2 -- Using testActionsGrammar3
		//There are 'two levels' worth of actions (the root and the actions)
		//There are conditions on both levels
		//There should ultimately only be one action returned, but with two potential bindings.
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar3);
		var volitionInstance = v.getFirst("MisterInit", "MadamRespond");
		var acceptedObject = v.isAccepted("MisterInit", "MadamRespond", volitionInstance);
		var volitionWeight = volitionInstance.weight;
		potentialActions = actionLibrary.getActionHierarchyFromVolition("MisterInit", "MadamRespond", volitionInstance, acceptedObject.accepted, volitionWeight, 1, cast);
		test.assert(_.keys(potentialActions).length, 1, "Wrong number of action groups (TEST 2)");
		
		//var affinityUpActions = potentialActions[0].actions;
		test.assert(potentialActions.length, 1, "Wrong number of affinity up actions!");
		var test2Action = potentialActions[0];
		test.assert(test2Action.name, "nimblemakefriends", "(TEST 2) Action name is incorrect");
		test.assert(test2Action.goodBindings.length, 2, "(TEST 2) Action goodBindings is incorrect");
		test.assert(test2Action.conditions.length, 3, "(TEST 2) Action conditions is incorrect");
		test.assert(test2Action.effects.length, 1, "(TEST 2) Action effects is incorrect");
		test.assert(test2Action.salience, 60, "(TEST 2) Action salience is incorrect");
		
		var goodBinding1 = test2Action.goodBindings[0];
		test.assert(goodBinding1.initiator, "MisterInit", "initiatorBinding is wrong in first combination (TEST2)" );
		test.assert(goodBinding1.luckyGuy, "Biff", "luckyGuy is wrong in first combination (TEST2)" );
		test.assert(goodBinding1.nimble1, "Bob", "nimble1 is wrong in first combination (TEST2)" );
		test.assert(goodBinding1.nimble2, "Alice", "nimble2 is wrong in first combination (TEST2)" );
		test.assert(goodBinding1.responder, "MadamRespond", "responder is wrong in first combination (TEST2)" );

		var goodBinding2 = test2Action.goodBindings[1];
		test.assert(goodBinding2.initiator, "MisterInit", "initiatorBinding is wrong in second combination (TEST2)" );
		test.assert(goodBinding2.luckyGuy, "Biff", "luckyGuy is wrong in second combination (TEST2)" );
		test.assert(goodBinding2.nimble1, "Alice", "nimble1 is wrong in second combination (TEST2)" );
		test.assert(goodBinding2.nimble2, "Bob", "nimble2 is wrong in second combination (TEST2)" );
		test.assert(goodBinding2.responder, "MadamRespond", "responder is wrong in second combination (TEST2)" );

		//TEST 3 -- Using testActionsGrammar4
		//Similar to testActionsGrammar3, but with testActionsGrammar4!
		//This one has three levels, with conditions at all levels.
		//At the most specific level (terminal) there is a condition that further constricts a role that was established at an earlier level.
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar4);
		volitionInstance = v.getFirst("MisterInit", "MadamRespond");
		acceptedObject = v.isAccepted("MisterInit", "MadamRespond", volitionInstance);
		volitionWeight = volitionInstance.weight;

		potentialActions = actionLibrary.getActionHierarchyFromVolition("MisterInit", "MadamRespond", volitionInstance, acceptedObject.accepted, volitionWeight, 1, cast);
		test.assert(_.keys(potentialActions).length, 1, "Wrong number of action groups (TEST 3)");
		
		affinityUpActions = potentialActions[0].actions;
		test.assert(affinityUpActions.length, 1, "Wrong number of affinity up actions!");
		var test3Action = affinityUpActions[0];
		test.assert(test3Action.name, "bestFriend", "(TEST 3) Action name is incorrect");
		test.assert(test3Action.goodBindings.length, 1, "(TEST 3) Action goodBindings is incorrect");
		test.assert(test3Action.conditions.length, 2, "(TEST 3) Action conditions is incorrect");
		test.assert(test3Action.effects.length, 1, "(TEST 3) Action effects is incorrect");
		test.assert(test3Action.salience, 60, "(TEST 3) Action salience is incorrect");
		
		goodBinding1 = test3Action.goodBindings[0];
		test.assert(goodBinding1.initiator, "MisterInit", "initiatorBinding is wrong in first combination (TEST3)" );
		test.assert(goodBinding1.luckyGuy, "Biff", "luckyGuy is wrong in first combination (TEST3)" );
		test.assert(goodBinding1.nimble1, "Alice", "nimble1 is wrong in first combination (TEST3)" );
		test.assert(goodBinding1.nimble2, "Bob", "nimble2 is wrong in first combination (TEST3)" );
		test.assert(goodBinding1.responder, "MadamRespond", "responder is wrong in first combination (TEST3)" );
		test.assert(goodBinding1.happyDude, "Scott", "happyDude is wrong in first combination (TEST3)" );

		//TEST 4 -- Using testActionGrammar7
		//This one has NO terminal actions that meet the preconditions, and I'm just kind of interested to
		//see what happens (and use this to help me firm up what I think SHOULD happen.)
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar7);
		potentialActions = actionLibrary.getActionHierarchyFromVolition("MisterInit", "MadamRespond", v, 1, cast);
		//console.log("******** There should be no terminals here!" , potentialActions);
		test.assert(potentialActions.length, 0, "No valid terminals should have led to a length of 0.");


		test.finish();

	};

	var testActionsWithInfluenceRules = function(){
		//console.log("*******************");
		//console.log("*******************");
		//console.log("*******************");
		ensemble.loadBaseBlueprints(testSocial);
		actionLibrary.clearActionLibrary();

		//Today, we'll be adjusting the qualities of MisterInit and MadamRespond, to make them both
		//more and less likely to want to do things with each other.
		var cast = ["Bob", "Alice", "Scott", "Biff", "MisterInit", "MadamRespond", "ThePrinceOfNothing"];

		var sampleVolitions = {
			"MisterInit": {
				"MadamRespond": [
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 60 }
				]
			},
			"MadamRespond": {
				"MisterInit": [
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 60 }
				]
			},
		};

		//var hardy1 -- MisterInit is hardy
		var hardy1Pred = {
			"category" : "trait",
			"type" : "hardy",
			"first" : "MisterInit",
			"value" : true
		};
		//var friend1 -- MisterInit and Biff are friends
		var friend1Pred = {
			"category" : "relationship",
			"type" : "friends",
			"first" : "MisterInit",
			"second" : "Biff",
			"value" : true
		};
		//var friend2 -- MadamRespond and Biff are friends
		var friend2Pred = {
			"category" : "relationship",
			"type" : "friends",
			"first" : "MadamRespond",
			"second" : "Biff",
			"value" : true
		};
		//var nimble1 -- bob is nimble
		var nimble1Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Bob",
			"value" : true
		};
		//var nimble2 -- Alice is nimble
		var nimble2Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Alice",
			"value" : true
		};
		//var nimble3 -- Scott is nimble
		var nimble3Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Scott",
			"value" : true
		};

		//friends3 -- Bob and Alice are friends
		var friends3Pred = {
			"category" : "relationship",
			"type" : "friends",
			"first" : "Bob",
			"second" : "Alice",
			"value" : true
		};
		//friends4 -- Scott and Biff are friends
		var friends4Pred = {
			"category" : "relationship",
			"type" : "friends",
			"first" : "Scott",
			"second" : "Biff",
			"value" : true
		};
		//lucky1  -- Biff is lucky
		var lucky1Pred = {
			"category" : "trait",
			"type" : "lucky",
			"first" : "Biff",
			"value" : true
		};
		//happy1 -- Alice is happy (THIS SHOULD MAKE IT SO THAT THE ONLY VALID COMBINATION IS THAT ALICE IS NIMBLE 1)
		var happy1Pred = {
			"category" : "status",
			"type" : "happy",
			"first" : "Alice",
			"vlaue" : true
		};
		//happy2 -- Scott is happy
		var happy2Pred = {
			"category" : "status",
			"type" : "happy",
			"first" : "Scott",
			"vlaue" : true
		};

		ensemble.set(hardy1Pred);
		ensemble.set(friend1Pred);
		ensemble.set(friend2Pred);
		ensemble.set(friends3Pred);
		ensemble.set(friends4Pred);
		ensemble.set(nimble1Pred);
		ensemble.set(nimble2Pred);
		ensemble.set(nimble3Pred);
		ensemble.set(lucky1Pred);
		ensemble.set(happy1Pred);
		ensemble.set(happy2Pred);

		var v = volition.register("main", sampleVolitions);
		var firstVolition = v.getFirst("MisterInit", "MadamRespond");
		var isAccepted = v.isAccepted("MisterInit", "MadamRespond", firstVolition);

		test.start("ActionLibrary", "testActionsWInfluenceRules");

		//This is the version that is 'most like' a 'normal' setup (i.e. volition->socialGameName->instantiations)
		actionLibrary.parseActions(testActionsGrammar2);
		volitionInstance = v.getFirst("MisterInit", "MadamRespond");
		acceptedObject = v.isAccepted("MisterInit", "MadamRespond", volitionInstance);
		volitionWeight = volitionInstance.weight;
		var potentialActions = actionLibrary.getSortedActionsFromVolition("MisterInit", "MadamRespond", volitionInstance, acceptedObject.accepted, volitionWeight, 3, cast);

		//console.log("Here are the contnets of potentialActions:", potentialActions);

		//TEST 1 -- Even though "reminisce" is defined before "tell joke", because tell joke has a higher influence rating, it should be sorted first.
		test.assert(potentialActions.length, 2, "TEST 1 Length of potential actions is incorrect!");
		test.assert(potentialActions[0].name, "TELLJOKE", "Name of first action is incorrect");
		test.assert(potentialActions[1].name, "REMINISCE", "Name of second action is incorrect!");
		test.assert(potentialActions[0].weight, 60, "Weight of first action is incorrect");
		test.assert(potentialActions[1].weight, 50, "Weight of second action is incorrect!");

		//TEST 2 -- A more complicated situation with multiple 'good bindings' -- this means we need to make sure that the weight of the 'parent' action is good.
		//It also means that we want it to actually match the 'best binding.'
		//So, maybe, let's make "Alice" the preferred person to be nimble1, by having there be an influence rule about number1 that applies to Alice but not to Bob.
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar5);
		volitionInstance = v.getFirst("MisterInit", "MadamRespond");
		acceptedObject = v.isAccepted("MisterInit", "MadamRespond", volitionInstance);
		volitionWeight = volitionInstance.weight;
		potentialActions = actionLibrary.getSortedActionsFromVolition("MisterInit", "MadamRespond", volitionInstance, acceptedObject.accepted, volitionWeight, 3, cast);
		//console.log("Here are my potential actions in this case... " , potentialActions);
		//Now, let's make sure that everything about these potential actions are what you would expect..
		test.assert(potentialActions.length, 1, "length of potential actions is incorrect (TEST 2)");
		test.assert(potentialActions[0].name, "NIMBLEMAKEFRIENDS", "potential action name is incorrect");
		test.assert(potentialActions[0].actions.length, 1, "length of 'nimblemakefriends actions is wrong");
		test.assert(potentialActions[0].conditions.length, 3, "length of conditions in 'nimblemakefriends' is wrong.");
		test.assert(potentialActions[0].goodBindings.length, 2, "length of good bindings in 'nimblemakefriends' is wrong.");
		test.assert(potentialActions[0].weight, 602, "weight of NIMBLEMAKEFRIENDS is wrong.");
		test.assert(potentialActions[0].goodBindings[0].weight$$, 602, "weight of the first character binding is wrong.");
		test.assert(potentialActions[0].goodBindings[1].weight$$, 60, "weight of the second character binding is wrong.");
		test.assert(potentialActions[0].actions[0].name, 'actualFriends', "name of terminal action is wrong. (TEST 2)");
		test.assert(potentialActions[0].actions[0].conditions.length, 0, "length of terminal action conditions is wrong (TEST 2)");
		test.assert(potentialActions[0].actions[0].effects.length, 1, "length of terminal action effects is wrong (TEST 2)");
		test.assert(potentialActions[0].actions[0].isAccept, true, "is accept is the wrong boolean value (TEST 2)");
		test.assert(potentialActions[0].actions[0].goodBindings.length, 2, "length of good bindings in terminal action is wrong.");
		test.assert(potentialActions[0].actions[0].goodBindings[0].weight$$, 602, "weight of the first character biding is wrong in terminal action");
		test.assert(potentialActions[0].actions[0].goodBindings[1].weight$$, 60, "weight of the second character binding is wrong in terminal action");
		test.assert(potentialActions[0].actions[0].goodBindings[0].nimble1, "Alice", "wrong person was assigned role of nimble1 in 'best binding'.");
		test.assert(potentialActions[0].actions[0].goodBindings[1].nimble1, "Bob", "wrong person was assigned role of nimble1 in 'second best binding'.");

		//TEST 3 -- more complicated still, we're going to start using something that has FOUR layers.
		//And, based on influence rules, the 'best binding' is going to change as we continue to snake down the chain...
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar6);
		volitionInstance = v.getFirst("MisterInit", "MadamRespond");
		acceptedObject = v.isAccepted("MisterInit", "MadamRespond", volitionInstance);
		volitionWeight = volitionInstance.weight;
		potentialActions = actionLibrary.getSortedActionsFromVolition("MisterInit", "MadamRespond", volitionInstance, acceptedObject.accepted, volitionWeight, 3, cast);
		//console.log("Here are my potential actions in this case... " , potentialActions);
		test.assert(potentialActions.length, 1, "Many actions, but they should all be part of just a single chain.");
		var layer1 = potentialActions[0];
		test.assert(layer1.actions.length, 1, "First layer action count is incorrect");
		test.assert(layer1.name, "NIMBLEMAKEFRIENDS", "first layer name is incorrect");
		test.assert(layer1.goodBindings.length, 2, "first layer good bindings length is incorrect");
		test.assert(layer1.goodBindings[0].nimble1, "Alice", "Wrong person bound to nimble1 ins layer 1 (1st binding");
		test.assert(layer1.goodBindings[0].weight$$, 75, "Wrong weight in layer 1 (1st binding)");
		test.assert(layer1.goodBindings[1].nimble1, "Bob", "Wrong person bound to nimble1 in layer 1 (2nd binding)");
		test.assert(layer1.goodBindings[1].weight$$, 60, "Wrong weight in layer 1 (1st binding)");
		test.assert(layer1.weight, 75, "Wrong weight in 'layer 1  (top level weight)");

		//In this layer, there is an influence rule which actually heavily disfavors
		//Alice as nimble1 -- her binding should go way down. Bob's binding should remain the same.
		var layer2 = layer1.actions[0];
		test.assert(layer2.actions.length, 1, "Second layer action count is incorrect");
		test.assert(layer2.name, "ONELASTSTEP", "second layer name is incorrect");
		test.assert(layer2.weight, 60, "now that a previously good binding is now found to be bad, weight should be adjusted.");
		test.assert(layer2.goodBindings.length, 2, "Second layer number of good bindings is wrong.");
		test.assert(layer2.goodBindings[0].nimble1, "Bob", "Wrong person bound to nimble 1 in layer 2 (binding 1)");
		test.assert(layer2.goodBindings[1].nimble1, "Alice", "Wrong person bound to nimble 1 in layer 2 (binding 2)");
		test.assert(layer2.goodBindings[0].weight$$, 60, "Wrong weight for binding 1 in layer 2");
		test.assert(layer2.goodBindings[1].weight$$, 55, "Wrong weight for binding 2 in layer 2");

		//In this layer, we have reached a terminal! But here's the twist: ONLY happy people can be nimble1
		//this should remove one of our good bindings, and update the weight of the action.
		var layer3 = layer2.actions[0];
		test.assert(layer3.name, "actualFriends4Degrees", "name of 3rd layer is incorrect");
		test.assert(layer3.weight, 92, "Layer 3 weight is incorrect");
		test.assert(layer3.conditions.length, 1, "Layer 3 number of conditions is incorrect");
		test.assert(layer3.goodBindings.length, 1, "Third layer number of good bindings is wrong.");
		test.assert(layer3.goodBindings[0].nimble1, "Alice", "Wrong person bound to nimble 1 in layer 3 (binding 1)");
		//test.assert(layer3.goodBindings[1].nimble1, "Alice", "Wrong person bound to nimble 1 in layer 3 (binding 2)");
		//test.assert(layer3.goodBindings[0].weight$$, 60, "Wrong weight for binding 1 in layer 3");
		test.assert(layer3.goodBindings[0].weight$$, 92, "Wrong weight for binding 1 in layer 3");

		test.finish();
	};

	var testReadingActionsFromMultipleFiles = function(){
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar8);
		test.start("ActionLibrary", "testActionsFromMultipleF");


		//TEST 0 -- if we read in actions at all, does it work?
		var allActions = actionLibrary.getAllActions();
		var startSymbols = actionLibrary.getStartSymbols();
		var nonTerminals = actionLibrary.getNonTerminals();
		var terminals = actionLibrary.getTerminalActions();
		test.assert(allActions.length, 4, "After reading in one file, number of actions is wrong!");
		test.assert(startSymbols.length, 1, "Start symbols wrong after reading in one file.");
		test.assert(nonTerminals.length, 3, "non terminal symbols wrong afer reading in one file.");
		test.assert(terminals.length, 1, "terminal symbol length wrong after reading in one file.");
		
		//TEST 1 -- reading in a second file.
		actionLibrary.parseActions(testActionsGrammar9);
		allActions = actionLibrary.getAllActions();
		startSymbols = actionLibrary.getStartSymbols();
		nonTerminals = actionLibrary.getNonTerminals();
		terminals = actionLibrary.getTerminalActions();
		//console.log("Here are the contnets of allActions " , allActions);
		//console.log("Here are the contnets of startSymbols " , startSymbols);
		//console.log("Here are the contnets of nonTerminals " , nonTerminals);
		//console.log("Here are the contnets of terminals" , terminals);
		test.assert(allActions.length, 5, "Uh oh, incorrect number of all actions when reading from two files!");
		test.assert(startSymbols.length, 1, "Start symbols wrong after reading in two files.");
		test.assert(nonTerminals.length, 4, "non terminal symbols wrong afer reading in two files.");
		test.assert(terminals.length, 1, "terminal symbol length wrong after reading in two files.");

		//BEN START HERE
		//Next up is making sure that when actions are read in from multiple files, we 
		//can still calculate volition across all of them as you would expect.
		var cast = ["Bob", "Alice", "Scott", "Biff", "MisterInit", "MadamRespond", "ThePrinceOfNothing"];

		var sampleVolitions = {
			"MisterInit": {
				"MadamRespond": [
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 60 }
				]
			},
			"MadamRespond": {
				"MisterInit": [
					{ "category": "network", "type": "affinity", "intentType": true, "weight": 60 }
				]
			},
		};

		var lucky1Pred = {
			"category" : "trait",
			"type" : "lucky",
			"first" : "Biff",
			"value" : true
		};
		var jealous1Pred = {
			"category" : "trait",
			"type" : "lucky",
			"first" : "Bob",
			"value" : true
		};
		var hardy1Pred = {
			"category" : "trait",
			"type" : "hardy",
			"first" : "Alice",
			"value" : true
		};
		//var nimble1 -- bob is nimble
		var nimble1Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Bob",
			"value" : true
		};
		//var nimble2 -- Alice is nimble
		var nimble2Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Alice",
			"value" : true
		};
		//var nimble3 -- Scott is nimble
		var nimble3Pred = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Scott",
			"value" : true
		};
		ensemble.set(lucky1Pred);
		ensemble.set(jealous1Pred);
		ensemble.set(hardy1Pred);
		ensemble.set(nimble1Pred);
		ensemble.set(nimble2Pred);
		ensemble.set(nimble3Pred);

		var v = volition.register("main", sampleVolitions);
		var firstVolition = v.getFirst("MisterInit", "MadamRespond");
		var isAccepted = v.isAccepted("MisterInit", "MadamRespond", firstVolition);
		var weight = firstVolition.weight;
		var potentialActions = actionLibrary.getSortedActionsFromVolition("MisterInit", "MadamRespond", firstVolition, isAccepted.accept, weight, 3, cast);

		test.assert(potentialActions.length, 2, "(TEST 2) length of potential actions is incorrect.");
		//console.log("Here are the potential actions!", potentialActions);
		var layer1 = potentialActions[0];
		test.assert(layer1.fileName, "testActionsGrammar8.json", "fileName of first read in file was incorrect");
		test.assert(layer1.actions.length, 1, "(TEST 2) length of layer1 actions is incorrect.");
		test.assert(layer1.name, "LAUGH", "(TEST 2) name of layer 1 action is incorrect.");
		var layer2 = layer1.actions[0];
		test.assert(layer2.name, "bondTerminal", "name of layer 2 action is incorrect.");
		test.assert(layer2.goodBindings.length, 2, "(TEST 2) Number of good bindings in layer 2 is incorrect.");
		test.assert(layer2.goodBindings[0].nimbleOne, "Alice", "(TEST 2) Wrong person bound to nimbleOne in layer2 aciton 1");
		test.assert(layer2.goodBindings[1].nimbleOne, "Alice", "(TEST 2) Wrong person bound to nimbleOne in layer2 aciton 1");
		test.assert(layer2.goodBindings[0].luckyGuy, "Biff", "(TEST 2) Wrong person bound to nimbleOne in layer2 aciton 1");
		test.assert(layer2.goodBindings[1].luckyGuy, "Bob", "(TEST 2) Wrong person bound to nimbleOne in layer2 aciton 1");


		//TEST 2.5 -- And, using the same setup as above, let's just make sure that you can get to 
		//the SAME terminal after following two distinct paths (i.e. different action gruops can lead to the same place).
		var layer1Action2 = potentialActions[1];
		test.assert(layer1Action2.fileName, "testActionsGrammar9.json", "fileName of second read in file was incorrect");

		if(layer1Action2 === undefined){
			test.assert(0, 1, "ERROR in Test 2.5 -- layer1Action2 was undefined (potentialActions was of the wrong length.");
			test.finish();
			return;
		}

		test.assert(layer1Action2.actions.length, 1, "(TEST 2.5), length of layer1Action2 actions is incorrect.");
		test.assert(layer1Action2.name, "BOND", "name of layer 2 aciton 1 is incorrect.");
		var layer2Action2 = layer1Action2.actions[0];
		test.assert(layer2Action2.name, "bondTerminal", "name of layer2action2 is incorrect");
		test.assert(layer2Action2.goodBindings.length, 1, "(TEST 2.5) Number of good bindings in layer 2 is incorrect.");
		test.assert(layer2Action2.goodBindings[0].nimbleOne, "Bob", "(TEST 2.5) Wrong person bound to nimbleOne in layer2 aciton 1");
		


		test.finish();
	};

var testGetAction = function(){
		console.log("inside of testGetAction!");
		socialRecord.clearEverything();
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar10);
		actionLibrary.parseActions(testActionsGrammar11);
		ensemble.loadBaseBlueprints(testSocial);
		ensemble.addRules(testVolitionRules);

		var cast = ["Bob", "Alice", "Scott", "Biff", "MisterInit", "MadamRespond", "ThePrinceOfNothing"];

		test.start("ActionLibrary", "testGetAction");

		
		//goal: simulate a "real situation" with characters with stuff specified in the socialRecord.
		//so, first we probably want to: populate the socialRecord with some predicates.
		//Then we want to "compute volitions" or whatever.
		//Then we want to use those volitions to get a good action.
		//NOTE: there may be some re-writing of actions that has to be done, now that we are in a 'real' enviorenment. Possibly...
		//NEXT UP: Make sure that the conditions of the actions are met (I think MisterInit might have to be lucky or something...)
		//NEXT UP: Double check the preconditions... even though I feel like it should have worked with this setup...
		//AND: I think what is happening is that 'friends' is the highest volition, but there is no coresponding action..
		//OH, hey, you know what, maybe that's what I want?
		//Let's pretend that is what I want...
		var attractedToPred1 = {
			"category" : "directedStatus",
			"type" : "attracted to",
			"first" : "MisterInit",
			"second" : "MadamRespond",
			"value" : true
		};
		var attractedToPred2 = {
			"category" : "directedStatus",
			"type" : "attracted to",
			"first" : "MadamRespond",
			"second" : "MisterInit",
			"value" : true
		};
		var luckyPred1 = {
			"category" : "trait",
			"type" : "lucky",
			"first" : "Biff",
			"value" : true
		};
		var nimblePred1 = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Scott",
			"value" : true
		};
		var nimblePred2 = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Alice",
			"value" : true
		};
		var happyPred1 = {
			"category" : "status",
			"type" : "happy",
			"first" : "MisterInit",
			"value" : true
		};

		ensemble.set(attractedToPred1);
		ensemble.set(attractedToPred2);
		ensemble.set(luckyPred1);
		ensemble.set(nimblePred1);
		ensemble.set(nimblePred2);
		ensemble.set(happyPred1);


		var volitions = ensemble.calculateVolition(cast);
		//console.log("*VOLITION* -- volitions", volitions);
		//ok, it is a big thing. What does it look like if we are just getting mister init to madam respond?
		//var firstVolition = volitions.getFirst("MisterInit", "MadamRespond");
		//console.log("*VOLITION* -- firstVolition", firstVolition);

		var allActions = actionLibrary.getAllActions();
		//console.log("*VOLITION* -- allActions" ,  allActions);

		var action = ensemble.getAction("MisterInit", "MadamRespond", volitions, cast);
		//console.log("*VOLITION* -- here is what the action we got looks like...", action);

		//TEST 1 -- Basic test -- can we successfully get "the best action" action, when an action exists, and there
		//are multiple choices for what the action might be.
		test.assert(action.name, "pickupLineTerminal", "ensemble.getAction returned the wrong action");
		test.assert(action.effects.length, 1, "ensemble.getAction returned an action with the wrong number of effects");
		test.assert(action.effects[0].first, "MisterInit", "The 'first' role in the returned action's effects was incorrect.");
		test.assert(action.effects[0].second, "MadamRespond", "The 'second' role in the returned action's effects was incorrect.");
		test.assert(action.effects[0].category, "relationship", "The category role in the returned action's effects was incorrect.");
		test.assert(action.effects[0].type, "involved with", "The 'type' role in the returned action's effects was incorrect.");

		//TEST 2 -- What happens when we search for an action, but no actions exist to be found?
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar12);
		action = ensemble.getAction("MisterInit", "MadamRespond", volitions, cast);
		//console.log("*VOLITION* -- what is the value of action now?" , action);
		test.assert(action, undefined, "There shouldn't have been any valid actions. The fact that it returned something is wrong!");

		//TEST 3 -- Can we get the 'best action' when there is all sorts of wackiness to the action structure (multiple layers, fewer layers, multiple terminal levels, etc.)
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar14); // a thing with a 4 layer
		actionLibrary.parseActions(testActionsGrammar15); // a thing with a 2 layer
		actionLibrary.parseActions(testActionsGrammar16); // thing with terminals at differing levels.
		action = ensemble.getAction("MisterInit", "MadamRespond", volitions, cast);

		test.assert(action.name, "nimblemakelovers", "ensemble.getAction returned the wrong action");
		test.assert(action.effects.length, 1, "ensemble.getAction returned an action with the wrong number of effects");
		test.assert(action.effects[0].first, "MadamRespond", "TEST 3 The 'first' role in the returned action's effects was incorrect.");
		test.assert(action.effects[0].second, "MisterInit", "TEST 3 The 'second' role in the returned action's effects was incorrect.");
		test.assert(action.effects[0].category, "network", "TEST 3 The category role in the returned action's effects was incorrect.");
		test.assert(action.effects[0].type, "affinity", "TEST 3 The 'type' role in the returned action's effects was incorrect.");



		test.finish();
	};

	var testGetActions = function(){
		console.log("inside of testGetActions!");
		ensemble.reset();
		socialRecord.clearEverything();
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar13);
		ensemble.loadBaseBlueprints(testSocial);
		ensemble.addRules(testVolitionRules);

		var cast = ["Bob", "Alice", "Scott", "Biff", "MisterInit", "MadamRespond", "ThePrinceOfNothing"];

		//MisterInit is attracted to MadamRespond
		//MadamRespond is attracted to Mister Init
		//Biff is lucky
		//MisterInit is lucky
		//MadamRespond has a kind face.
		//Scott is nimble
		//Alice is nimble
		//MisterInit is happy
		//MisterInit has the following volitions for MadamResponder: StartDating, StartFriends (and maybe raise trust)

		var attractedToPred1 = {
			"category" : "directedStatus",
			"type" : "attracted to",
			"first" : "MisterInit",
			"second" : "MadamRespond",
			"value" : true
		};
		var attractedToPred2 = {
			"category" : "directedStatus",
			"type" : "attracted to",
			"first" : "MadamRespond",
			"second" : "MisterInit",
			"value" : true
		};
		var trustingPred1 = {
			"category" : "trait",
			"type" : "kind face",
			"first" : "MadamRespond",
			"value" : true
		};
		var kindFacePred1 = {
			"category" : "trait",
			"type" : "trusting",
			"first" : "MisterInit",
			"value" : true
		};
		var luckyPred1 = {
			"category" : "trait",
			"type" : "lucky",
			"first" : "Biff",
			"value" : true
		};
		var luckyPred2 = {
			"category" : "trait",
			"type" : "lucky",
			"first" : "MisterInit",
			"value" : true
		};
		var nimblePred1 = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Scott",
			"value" : true
		};
		var nimblePred2 = {
			"category" : "trait",
			"type" : "nimble",
			"first" : "Alice",
			"value" : true
		};
		var happyPred1 = {
			"category" : "status",
			"type" : "happy",
			"first" : "MisterInit",
			"value" : true
		};

		ensemble.set(attractedToPred1);
		ensemble.set(attractedToPred2);
		ensemble.set(kindFacePred1);
		ensemble.set(trustingPred1);
		ensemble.set(luckyPred1);
		ensemble.set(luckyPred2);
		ensemble.set(nimblePred1);
		ensemble.set(nimblePred2);
		ensemble.set(happyPred1);

		var volitions = ensemble.calculateVolition(cast);


		test.start("ActionLibrary", "testGetActions");

		//TEST 1 -- 2 intents, 1 action per intent, 1 action per action group.
		var actions = ensemble.getActions("MisterInit", "MadamRespond", volitions, cast, 2, 1, 1);
		
		test.assert(actions.length, 2, "Test 1 -- number of actions returned was incorrect.");
		test.assert(actions[0].name, "pickupLineTerminal", "Test 1 -- name of the first action was incorrect.");
		
		//557 = 542 from action library, + 5 from 'attraction makes people want to date' + 10 from 'recent attraction makes people really want to date.'
		test.assert(actions[0].weight, 557, "Test 1 -- weight of the first action was incorrect.");
		test.assert(actions[1].name, "laughTerminal2", "Test 1 -- name of the second action was incorrect.");
		test.assert(actions[1].weight, 7, "Test 1 -- weight of the second action was incorrect.");

		//TEST 2 -- 2 intents, 1 action per volition, 2 actions per action group.
		//This is being done on two intents, one of which has two terminals, and the other only has one terminal, so three things should be returned in total.
		actions = ensemble.getActions("MisterInit", "MadamRespond", volitions, cast, 2, 1, 2);
		test.assert(actions.length, 3, "Test 2 -- number of actions returned was incorrect.");
		test.assert(actions[0].name, "pickupLineTerminal", "Test 2 -- name of first action returned was incorrect.");
		//557 = 542 from action library, + 5 from 'attraction makes people want to date' + 10 from 'recent attraction makes people really want to date.'
		test.assert(actions[0].weight, 557, "Test 2 -- weight of first action returned was incorrect.");
		test.assert(actions[1].name, "laughTerminal2", "Test 2 -- name of second action returned was incorrect.");
		test.assert(actions[1].weight, 7, "Test 2 -- weight of the second action returned was incorrect.");
		test.assert(actions[2].name, "laughTerminal1", "Test 2 -- name of the third action returned was incorrect.");
		test.assert(actions[2].weight, 5, "Test 2 -- weight of the third action returned was incorrect.");

		//TEST 3 -- 2 intents, 2 actions per volition, 1 action per action group.

		actions = ensemble.getActions("MisterInit", "MadamRespond", volitions, cast, 2, 2, 1);
		test.assert(actions.length, 4, "Test 3 -- number of actions returned was incorrect.");
		test.assert(actions[0].name, "pickupLineTerminal", "Test 3 -- name of first actions was incorrect.");
		//557 = 542 from action library, + 5 from 'attraction makes people want to date' + 10 from 'recent attraction makes people really want to date.'		
		test.assert(actions[0].weight, 557, "Test 3 -- weight of first action was incorrect.");
		test.assert(actions[1].name, "askoutTerminal", "Test 3 -- name of second action was incorrect.");
		test.assert(actions[1].weight, 15, "Test 3 -- weight of second action was incorrect.");
		test.assert(actions[2].name, "laughTerminal2", "Test 3 -- name of third action was incorrect.");
		test.assert(actions[2].weight, 7, "Test 3 -- weight of third action was incorrect.");
		test.assert(actions[3].name, "bondTerminal", "Test 3 -- name of fourth action was incorrect.");
		test.assert(actions[3].weight, 5, "Test 3 -- weight of the fourth action was incorrect.");

		//TEST 4 -- 2 Intents, 2 actions per volition, 2 actions per action group.
		actions = actions = ensemble.getActions("MisterInit", "MadamRespond", volitions, cast, 2, 2, 2);
		console.log("Here is the getActions actions: " , actions);
		test.assert(actions.length, 5, "Test 4 -- number of actions returned was incorrect.");
		test.assert(actions[0].name, "pickupLineTerminal", "Test 4 -- name of first action was incorrect.");
		test.assert(actions[1].name, "askoutTerminal", "Test 4 -- name of second action was incorrect.");
		test.assert(actions[2].name, "laughTerminal2", "Test 4 -- name of third action was incorrect.");
		test.assert(actions[3].name, "bondTerminal", "Test 4 -- name of fourth action was incorrect.");
		test.assert(actions[4].name, "laughTerminal1", "Test 4 -- name of fifth action was incorrect.");


		//Alright, all of the above was done with a 'traditional' action structure (Intent->social game name->terminals)
		//The following test have FOUR layers.
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar14); // a thing with a 4 layer
		actionLibrary.parseActions(testActionsGrammar15); // a thing with a 2 layer
		actionLibrary.parseActions(testActionsGrammar16); // thing with terminals at differing levels.
		
		//TEST 5 -- 2 intents, 1 action per intent, 1 action per action group 
		var actions = ensemble.getActions("MisterInit", "MadamRespond", volitions, cast, 2, 1, 1);
		console.log("TEST 5 SOME ACTIONS", actions);
		test.assert(actions.length, 2, "Test 5 -- number of actions returned was incorrect.");
		test.assert(actions[0].name, "nimblemakelovers", "Test 5 -- name of the first action was incorrect.");
		test.assert(actions[0].weight, 15, "Test 5 -- weight of the first action was incorrect.");
		test.assert(actions[1].name, "neverGetHere", "Test 5 -- name of the second action was incorrect.");
		test.assert(actions[1].weight, 5, "Test 5 -- weight of the second action was incorrect.");


		//TEST 6 -- 3 intents, 2 actions per volition, 1 actions per action group.
		//We have three inents here (start dating, start friends, raise trust)
		//start dating and start friends only have 1 valid action, so they'll return 1.
		//raise trust does have action groups, so it will return the best action in two different action groups
		//for a total of four actions.
		actions = ensemble.getActions("MisterInit", "MadamRespond", volitions, cast, 3, 2, 1);
		test.assert(actions.length, 4, "Test 6 -- number of actions returned was incorrect.");
		test.assert(actions[0].name, "nimblemakelovers", "Test 6 -- name of first action returned was incorrect.");
		test.assert(actions[0].weight, 15, "Test 6 -- weight of first action returned was incorrect.");
		test.assert(actions[1].name, "lowerTerminalraiseTrust2", "Test 6 -- name of second action returned was incorrect.");
		test.assert(actions[1].weight, 14, "Test 6 -- weight of the second action returned was incorrect.");
		test.assert(actions[2].name, "neverGetHere", "Test 6 -- name of the third action returned was incorrect.");
		test.assert(actions[2].weight, 5, "Test 6 -- weight of the third action returned was incorrect.");
		test.assert(actions[3].name, "upperTerminalraiseTrust", "Test 6 -- name of the fourth action returned was incorrect.");
		test.assert(actions[3].weight, 4, "Test 6 -- weight of the fourth action returned was incorrect.");



		var allActions = ensemble.getActions("MisterInit", "MadamRespond", volitions, cast, 100, 100, 100);

		console.log("TEST 6 SOME ACTIONS " , actions);
		console.log("TEST 6 ALL ACTIONS actions here are... " , allActions);

		test.finish();
	};

	var testUndirectedActions = function(){
		test.start("ActionLibrary", "testUndirectedActions");

		//Zero everything out, load in the schema/actions/rules we want to be using.
		ensemble.reset();
		socialRecord.clearEverything();
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(rpgActions);
		ensemble.loadBaseBlueprints(rpgSchema);
		ensemble.addRules(samsVolition);
		socialRecord.setupNextTimeStep(0);
		var cast = ["brax", "tarloc", "finnigan", "charles"];

		//Calculate volitions and find the top action.
		var volitions = ensemble.calculateVolition(cast);
		var actions = ensemble.getActions("brax", "brax", volitions, cast, 2, 1, 1);
		var topAction = actions[0];

		//The predicate we are going to be searching for (value is left off to make it generic)
		var braxIntelligence = {
			"category" : "attribute",
			"type" : "intelligence",
			"first" : "brax"
		};

		//socialRecord should be empty at this point, creates a new 'default' entry in it (which should be 10)
		var result = ensemble.get(braxIntelligence);

		//Make sure that the thing that was returned was correct.
		test.assert(actions.length, 1, "Wrong number of actions returned.");
		test.assert(actions[0].name, "read", "Wrong action returned when boosting an undirected element.");
		test.assert(actions[0].weight, 15, "unexpected weight for boosting an undirected element.");
		test.assert(result[0].value, 10, "socialRecord for the result was unexpected value.");

		//Go through each effect of the action and 'set' it's effects (should increase intelligence by 1)
		for(var i = 0; i < actions[0].effects.length; i += 1){
			ensemble.set(actions[0].effects[i]);
		}

		//Get the new value of intelligence, and double check that it did in fact increase by 1.
		result = ensemble.get(braxIntelligence);
		test.assert(result[0].value, 11, "After doing the 'read' action, Brax's intelligence did not appear to increase.");

		//All done!
		test.finish();
	};

	var testStartSymbolAlreadyExists = function(){
		test.start("ActionLibrary" , "testStartSymbolAlreadyExis");
		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar17);
		var repeatStartsymbol = {
			"name" : "RAISETRUST2",
			"intent" : {
				"category" : "network",
				"type"  : "trust",
				"intentType" : true,
				"first" : "initiator",
				"second" : "responder"
			},
			"conditions" : [],
			"influenceRules" : [],
			"leadsTo" : ["baby"]
		};
		var result = actionLibrary.startSymbolAlreadyExists(repeatStartsymbol);
		
		//TEST 1 -- we expect it to believe that the start symbol should already exist!
		test.assert(result, true, "TEST 1 -- start symbol is apparantly not repeated.");

		actionLibrary.clearActionLibrary();
		actionLibrary.parseActions(testActionsGrammar17);
		var nonRepeatStartSymbol = {
			"name" : "NOTRAISETRUST",
			"intent" : {
				"category" : "network",
				"type"  : "trust",
				"intentType" : false,
				"first" : "initiator",
				"second" : "responder"
			},
			"conditions" : [],
			"influenceRules" : [],
			"leadsTo" : ["baby"]
		};
		var result = actionLibrary.startSymbolAlreadyExists(nonRepeatStartSymbol);
		//TEST 2 -- we expect it to believe that the start symbol should NOT already exist!
		test.assert(result, false, "TEST 2 -- start symbol IS apparantly repeated, but we thought it wouldn't be.");
	

		test.finish();
	};

/***************************************************************/
	/* INTERFACE */
	/***************************************************************/

	var actionLibraryUnitTestInterface = {
		runTests: runTests
	};

	return actionLibraryUnitTestInterface;

});