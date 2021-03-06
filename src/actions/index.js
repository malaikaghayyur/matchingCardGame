import _ from 'lodash';

/**
 * Sets up the playing deck of standard 52 playing cards.
 */
export function setupDeck(){
	console.log('setupDeck()');

	var deck = {};
	for (var s = 1; s <= 4; s++){
		for(var n = 1; n <= 13; n++){
			let id = s+'.'+n;
			deck[id] = {s:s, n:n, v:0};
		}
	}

	return {
		type: 'ADD_CARDS',
		data: deck
	};
}

/**
 * This action will create the playingCards reducer.
 * This step requires some sophisticated logic and several
 * recursive functions to work correctly. 
 *
 * So clear your head, grab a coffee and go through the next 
 * few functions with a fresh mind.
 */
export function createPlayingCardsArray(){
	console.log('createPlayingCardsArray()');

	var playingCards = {};

	for(var i = 0; i < 12; i++){
		playingCards[i] = _cardPicker(playingCards);
	}

	// Catch any card's whos instances number more than two.
	// Since each card has only four instances in a deck;
	// and we will be picking a pair for these cards in the next step below.
	var cardInstanceCounter = {};
	for(var y = 0; y < 12; y++){	  		
   		
   		playingCards[y] = _cardInstanceValidator(y, cardInstanceCounter, playingCards);
 		
 		// Get the retrived card value (in case the card has changed in the instance validator script above).
 		let c = playingCards[y].split(".");
 		
 		// Add it to the cardInstanceCounter array.
 		cardInstanceCounter[c[1]]= (typeof cardInstanceCounter[c[1]] == 'undefined') ? 1 : cardInstanceCounter[c[1]] + 1;
	
	}

	// Now we have the first twelve cards for the field picked correctly.
	// We must go ahead a pick a matching pair for each.
	for(var x = 12; x < 24; x++){  		
  		
  		// Get the card value for the first card to be paired here:
  		let c = playingCards[x - 12].split(".");
  		
  		// Run it through _pickSuitForPairSelection() to get the 
  		// matching card's suit value (between 1-4)...
  		let s = _pickSuitForPairSelection(playingCards, (x - 12), 0);
  		

  		// Below we run a precautionary second validation on the picked, 
  		// matched card since we had some missed cases in our logic 
  		// during the initial development of this game.
  		let existingKey = _.findKey(playingCards, 
									function(card){
										return card == s+'.'+c[1];
									});
  		
  		if(typeof existingKey !== 'undefined'){
  			console.log('Error - SERIOUSLY should not have happenned', c, s, cardInstanceCounter, playingCards);
			location.reload();
			throw new Error('Card Generation failed. Retrying..');
  		}

		// Add the new paired card to the playingCards array:
		playingCards[x] = s+'.'+c[1];
	}

	return {
		type: 'ADD_PICKED_CARDS',
		data: _.shuffle(playingCards)
	}

}

/**
 * Helper function for createPlayingCardsArray()
 */
function _cardPicker(playingCards){
	var s = _randIntGenerator(1, 4);
	var n = _randIntGenerator(1, 13);
	var card = s+'.'+n;
	
	let existingKey = _.findKey(playingCards, 
									function(card){
										return card == s+'.'+n;
									});

	if (typeof existingKey !== 'undefined') {
		return _cardPicker(playingCards);
	}else{
		return card;		
	}
}

/**
 * Helper function that generates a random number inclusive of 
 * min & max values provided.
 */
export function _randIntGenerator(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max) + 1;
	return Math.floor(Math.random() * (max - min)) + min; 
}

/**
 * A helper function used by createPlayingCardsArray().
 * It's a recursive function that should catch any cards 
 * whos instances number more than 2.
 */
function _cardInstanceValidator(y, counter, playingCards){
	let c = playingCards[y].split(".");
	let num = (typeof counter[c[1]] == 'undefined') ? 1 : counter[c[1]] + 1;

	if(num > 2){
		//try to fix it another time...
		playingCards[y] = _cardPicker(playingCards);
		return _cardInstanceValidator(y, counter, playingCards);
	}else{
		return playingCards[y];
	}
}

/**
 * Helper recursive function for createPlayingCardsArray()
 */
function _pickSuitForPairSelection(playingCards, firstCardKey, iteration = 0){
	iteration++;
	let s = _randIntGenerator(1, 4);
  	let c = playingCards[firstCardKey].split(".");

	if(s == c[0] && s == 1){
		s = s + 1;
	}else if(s == c[0] && s == 4){
		s = s - 1;
	}

	let existingKey = _.findKey(playingCards, 
									function(card){
										return card == s+'.'+c[1];
									});

	if(typeof existingKey !== 'undefined'){
		if(iteration >= 4){
			// All possibilities are failing, 
			// Time to make very literal choices...
			for(var i = 1; i < 5; i++){
				let newKey = _.findKey(playingCards, 
									function(card){
										return card == i+'.'+c[1];
									});

				if(typeof newKey === 'undefined'){
					return i;
				}
			}

			// We have failed. 
			// Reload the app, and cross your fingers.
			console.log('Error - should not have happenned', c, playingCards);
			location.reload();
			throw new Error('Card Generation failed. Retrying..');
		}

		return _pickSuitForPairSelection(playingCards, firstCardKey, iteration);
	}

	return s;
}

/**
 * Run after every turn..
 */
export function matchCards(card1, card2){
	console.log('matchCards()');
	
	var matrix1 = card1.split('.');
	var matrix2 = card2.split('.');

	if (matrix1[1] == matrix2[1]){

		return {
			type: 'NEW_MATCHED_CARDS',
			data: {
				card1: card1,
				card2: card2,
			}
		};

	}else{
		return {
			type: ''
		};		
	}
}

/**
 * Update state's turns counter
 */
export function turnsCounter (){
	console.log('turnsCounter()');

	return {
		type: 'TURNS_INCREMENT'
	}
}

/**
 * Calculate total game time at the end of the game for score calculation.
 */
export function startTimer(){
	console.log('startTimer()');

	let d = new Date();
	return {
		type: 'START_TIMER',
		data: d.getTime()
	}
}

/**
 * Calculate total game time at the end of the game for score calculation.
 */
export function stopTimer(){
	console.log('stopTimer()');

	let d = new Date();
	return {
		type: 'STOP_TIMER',
		data: d.getTime()
	}
}

/**
 * Calculate total game time at the end of the game for score calculation.
 */
export function totalTimeCalculator(start, end){
	console.log('totalTimeCalculator()', start, end);

	let t = (end - start) / 1000 / 60;

	// rounded gives us a 2 decimal placed value
	let rounded = Math.round(t * 100) / 100;
	return {
		type: 'TOTAL_TIME_UPDATE',
		data: rounded
	}
}

/**
 * Calculates the score at the end of the game.
 */
export function finalScoreCalculator(matches, turns, totalTime){
	console.log('finalScoreCalculator()', matches, turns, totalTime);

	let score = matches * 100 / (turns * (totalTime * 2));
	let rounded = Math.round(score) * 10;

	return {
		type: 'FINAL_SCORE_UPDATE',
		data: rounded
	}
}

export function newGame(){
	console.log('newGame()');

	return {
		type: 'NEW_GAME'
	}
}

export function addSysMsgHeading(text){
	return {
		type: 'ADD_MSG_HEADING',
		heading: text
	}
}

export function addSysMsg(text){
	return {
		type: 'ADD_MSG',
		msg: text
	}
}

export function clearSysMsg(){
	return {
		type: 'CLEAR_MSGS'
	}
}
