var firebaseConfig = {
  apiKey: "AIzaSyB-dnsK-wEnjL-E_1JBYhBYRkMBH6UXH-U",
  authDomain: "deck-of-cards-f89a5.firebaseapp.com",
  databaseURL: "https://deck-of-cards-f89a5.firebaseio.com",
  projectId: "deck-of-cards-f89a5",
  storageBucket: "deck-of-cards-f89a5.appspot.com",
  messagingSenderId: "254827066141",
  appId: "1:254827066141:web:7a1add88738ae8e15367f4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//=======================================
//Firebase setup
//=======================================

// get the game's unique key from the EJS variable
let gameKey = document.querySelector('#data').dataset.gamekey;
// console.log(gameKey);

// create a firebase node with the game's unique key
let gameListRef = firebase.database().ref(`gameList_${gameKey}`);
gameListRef.push();

let DeckReference = firebase.database().ref(`gameKey_${gameKey}`);
let deckRef = DeckReference.child('deckoCards');
let player1Ref = DeckReference.child('player1Hand');
let player2Ref = DeckReference.child('player2Hand');
let count1Ref = DeckReference.child('count1');
let count2Ref = DeckReference.child('count2');
let crib1Ref = DeckReference.child('crib1');
let crib2Ref = DeckReference.child('crib2');
let starterRef = DeckReference.child('starter');
let scoreboardRef = DeckReference.child('scoreboard');
let autoCribRef = DeckReference.child('autoCrib'); 
let counterRef = DeckReference.child('counter');
let coinFlipRef = DeckReference.child('coinFlip');
let resetRef = DeckReference.child('reset');

//set the player hands to empty on page load
player1Ref.set({player1Cards:[]});
player2Ref.set({player2Cards:[]});
count1Ref.set({count:[]});
count2Ref.set({count:[]});
crib1Ref.set({crib:[]});
crib2Ref.set({crib:[]});
starterRef.set({starter:[]})
scoreboardRef.set({score1: 0, score2: 0});
autoCribRef.set({fbAutoCrib1: 0, fbAutoCrib2: 0});
counterRef.set(0);
resetRef.set(false);
// coinFlipRef.set({ player1: '', player2: '' });

// remove the game's firebase node when the players leave the page
window.addEventListener('beforeunload', (event) => {
  DeckReference.set({});
})

//========================================
//create card class and deck
//========================================
class Card {
  constructor(suit, value){
    this.suit = suit;
    this.value = value;
  }
}

//create deck out of Card class
class Deck {
  constructor() {
    this.deck = [];
    deckRef.set(this.deck)
  }

  createDeck(suits, values) {
    for(let suit of suits) {
      for(let value of values){
        this.deck.push(new Card(suit, value));
      }
    }
    deckRef.set(this.deck);
    return this.deck;
  }

  shuffle() {
    let counter = this.deck.length, temp, i;

    while(counter) {
      i = Math.floor(Math.random() * counter--);
      temp = this.deck[counter];
      this.deck[counter] = this.deck[i];
      this.deck[i] = temp;
    }
    deckRef.set(this.deck);
    return this.deck;
  }

  deal(cards) {
    let hand = [];
    while(hand.length < cards) {
      hand.push(this.deck.pop());
    }
    deckRef.set(this.deck);
    return hand;
  }
}

//hold the suits and values
let suits = ['Hearts', 'Diamonds', 'Spades', 'Clubs'];
let values = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];

//create new deck and shuffle it
let cardDeck = new Deck();
cardDeck.createDeck(suits, values);
cardDeck.shuffle();

//make player hands
// let player1Hand = [];
let player2Hand = [];
let turn = true;
let autoCrib1 = 0;
let autoCrib2 = 0;

//get player hands html elements
let player1El = document.querySelector('.player1');
let player2El = document.querySelector('.player2');

let $player1El = $('.player1');
let $player2El = $('.player2');

// Curtain elements
let $hand1Curtain = $('.hand1-curtain');
let $hand2Curtain = $('.hand2-curtain');

//get player crib elements
let player1CribEl = document.querySelector('.crib1');
let player2CribEl = document.querySelector('.crib2');

let $player1Crib = $('.crib1');
let $player2Crib = $('.crib2');

let starterEl = document.querySelector('.starter');
let player1PotEl = document.querySelector('.player1-pot');
let player2PotEl = document.querySelector('.player2-pot');

// Score Elements
let player1ScoreEl = document.querySelector('#score1-counter');
let player2ScoreEl = document.querySelector('#score2-counter');

//get button elements
let dealButton = document.querySelector('#dealEl');
let resetButton = document.querySelector('#resetEl');

// get count element
let countEl = document.querySelector('.count');

let $showButton1 = $('.show-hand-1');
let $showButton2 = $('.show-hand-2');
let $cribButton1 = $('.show-crib-1');
let $cribButton2 = $('.show-crib-2');

$showButton1.click(()=>{
  // $player1El.toggleClass('hide');
  $hand1Curtain.slideToggle();
});

$showButton2.click(()=>{
  // $player2El.toggleClass('hide');
  $hand2Curtain.slideToggle();
});

$cribButton1.click(()=>{
  // $player1Crib.toggleClass('hide');
  $('.crib1-curtain').slideToggle();
});

$cribButton2.click(()=>{
  // $player2Crib.toggleClass('hide')
  $('.crib2-curtain').slideToggle();
});

// determine if player 1 or 2
coinFlipRef.once('value', (snap) => {
  let val = snap.val();
  console.log(val);
  if(!val) {
    val = {player1: "Player 1", player2: ""};
    console.log(val);
    $hand1Curtain.hide();
    player2El.classList.add('hide', 'noClick');
    coinFlipRef.set(val);
    $showButton2.addClass('hide noClick');
    showModal(val.player1);
  } else if(val.player1 === "Player 1") {
    val.player2 = 'Player 2';
    console.log(val);
    $hand2Curtain.hide();
    player1El.classList.add('hide', 'noClick');
    coinFlipRef.set(val);
    $showButton1.addClass('hide noClick');
    showModal(val.player2);
  }
})

function showModal(playerNum) {
  let modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
  <div class="modal-content">
    <h3>You are ${playerNum}!</h3>
    <p class="modal-description">Welcome to online cribbage! Here's some important info before you get started.</p>
    <ul>
    <li>The game will reset if you or the other player reloads or refreshes the page.</li>
    <li>As ${playerNum}, you will not see the other player's cards until they are played.</li>
    <li>The link to this game will be valid for 24 hours after it was created.</li>
    <li>The first two cards you click in your hand will go to the crib, the rest will go to the play.</li>
    <li>If you need to look up the rules, <a href="https://bicyclecards.com/how-to-play/cribbage/" target="_blank" rel="noopener">click here</a>.</li>
    <p>That's it, have fun!</p>
    <span class="modal-close" onclick="closeModal()">x</span>
  </div>
  `;
  document.querySelector('#controls-wrapper').appendChild(modal);
}

function closeModal() {
  document.querySelector('.modal').classList.add('hide-modal');
}

// update firebase score reference when click scorboard element
player1ScoreEl.addEventListener('input', (e) => {

  scoreboardRef.once('value', (snap) => {
    let fbScore = snap.val();
    // console.log(fbScore);
    let score = player1ScoreEl.value;
    fbScore.score1 = score;
    scoreboardRef.set(fbScore);
    score = fbScore.score1;
  })
})

player2ScoreEl.addEventListener('input', (e) => {

  scoreboardRef.once('value', (snap) => {
    let fbScore = snap.val();
    // console.log(fbScore);
    let score = player2ScoreEl.value;
    fbScore.score2 = score;
    scoreboardRef.set(fbScore);
    score = fbScore.score2;
  })
})

scoreboardRef.on('value', (snap) => {
  player1ScoreEl.value = snap.val().score1;
  player2ScoreEl.value = snap.val().score2;
})

//===================================
// Reset all values except scoreboard
// on reset button click
//===================================
resetButton.addEventListener('click', (e) => {
  e.preventDefault();

  resetRef.once('value', (snap)=>{
    let val = snap.val();
    val = !val;
    resetRef.set(val);
  })
})

resetRef.on('value', (snap)=> {
  //set the player hands to empty on page load
  player1Ref.set({player1Cards:[]});
  player2Ref.set({player2Cards:[]});
  count1Ref.set({count:[]});
  count2Ref.set({count:[]});
  crib1Ref.set({crib:[]});
  crib2Ref.set({crib:[]});
  starterRef.set({starter:[]});
  counterRef.set(0);
  autoCribRef.set({fbAutoCrib1: 0, fbAutoCrib2: 0});

  // create a new deck and shuffle it
  cardDeck = new Deck();
  cardDeck.createDeck(suits, values);
  cardDeck.shuffle();

  // reset the player hand arrays and the turn boolean
  // player1Hand = [];
  player2Hand = [];
  turn = true;
  autoCrib1 = 0;
  autoCrib2 = 0;

  //reset the pot elements on click (in case there's a glitch)
  player1PotEl.innerHTML = '';
  player2PotEl.innerHTML = '';
  console.log('reset');
});

//============================================
//call deal function when click on deal button
//============================================
dealButton.addEventListener('click', deal);

function deal(){
  deckRef.once('value', (snap)=>{
    let fbDeck = snap.val();
    // let val = document.querySelector('input[name=master-controls]:checked').value;
    // if(val === 'deal'){
      for(let i=0; i<12; i++){
        let fbCard = fbDeck.shift();
        if(turn){
          player1Ref.push().set(fbCard);
          turn = false;
        } else {
          player2Ref.push().set(fbCard);
          turn = true;
        }
      // }
    } 
    // if(val === 'starter') {
      console.log('starter');
      starterRef.push().set(fbDeck.shift());
    // }
    deckRef.set(fbDeck);
  });
};

//listen for change in value of player 1 hand
//then creates an html element with that suit and value
player1Ref.on('value', (snap)=>{
  let hand = snap.val();
  //reset the players hand element
  player1El.innerHTML='';
  // console.log('render Player 1 hand');
  getFBHand(player1El, hand);
});

//listen for change in value of player 2 hand
//then creates an html element with that suit and value
player2Ref.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player2El.innerHTML='';
  // console.log('render Player 2 hand');
  getFBHand(player2El, hand);
})

starterRef.on('value', (snap)=>{
  let hand = snap.val();
  starterEl.innerHTML = '';
  getFBHand(starterEl, hand);
})

crib1Ref.on('value', (snap)=>{
  let hand = snap.val();
  player1CribEl.innerHTML = '';
  getFBHand(player1CribEl, hand);
})

crib2Ref.on('value', (snap)=>{
  let hand = snap.val();
  player2CribEl.innerHTML = '';
  getFBHand(player2CribEl, hand);
})

count1Ref.on('value', (snap)=>{
  let hand = snap.val();
  // let val = document.querySelector('input[name="cribPotRadio"]:checked').value;
  autoCribRef.once('value', (snap) => {
    let val = snap.val();
    if(val.fbAutoCrib1 === 2) {
      console.log('render POT1');
      player1PotEl.innerHTML = '';
      getFBHand(player1PotEl, hand);
    } else if(val.fbAutoCrib1 < 2) {
      // console.log('render CRIB1');
      player1CribEl.innerHTML = '';
      getFBHand(player1CribEl, hand)
    }
  })
})

count2Ref.on('value', (snap)=>{
  let hand = snap.val();
  // let val = document.querySelector('input[name="cribPotRadio"]:checked').value;
  autoCribRef.once('value', (snap) => {
    let val = snap.val();

    if(val.fbAutoCrib2 === 2) {
      console.log('render POT2')
      player2PotEl.innerHTML = '';
      getFBHand(player2PotEl, hand);
    } else if(val.fbAutoCrib2 < 2) {
      // console.log('render CRIB2')
      player2CribEl.innerHTML = '';
      getFBHand(player2CribEl, hand)
    }
  })
})

counterRef.on('value', (snap) => {
  let count = snap.val();
  countEl.innerHTML = count;
})

//this runs every time there is a change in a player's hand in the database
//for each key in hand, create HTML element and append to hand element
function getFBHand(handEl, hand){
  for(key in hand){
    // console.log(key);
    let suit = hand[key].suit;
    let value = hand[key].value;
    let cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.classList.add(suit);
    cardEl.innerHTML =
      `<span class="${value} value">${value}</span><br>
       <!-- <span>${suit}</span>-->`;
    handEl.appendChild(cardEl);
  }
}

player1El.addEventListener('click', (e)=>{
  //get nearest card element to the target
  let card = e.target.closest('div.card');
  let newHand = {};
  // console.log(card);
  //get the suit and card value for the card that was clicked
  let suit = card.classList[1];
  let value = card.querySelector('span').innerHTML;
  // console.log(suit, value);

  card.remove()
  //get a snapshot of the player's hand search it for the
  //corresponding card that was clicked
  player1Ref.once('value', (snap)=>{
    let hand = snap.val();
    // console.log('player 1 hand: ', hand);
    // console.log(hand);
    //iterate through the cards in the hand and find the one that was clicked
    autoCribRef.once('value', (snap) => {
      let val = snap.val();
      
      for (key in hand) {
        // grab the suit and value of the key being checked
        let fbSuit = hand[key]['suit'];
        let fbValue = hand[key]['value'];
  
        //check if the fb card matches the card clicked
        if (fbSuit === suit && fbValue.toString() === value) {
          // console.log('correct card');
          // if there are less than 2 cards in player's crib already
          if (val.fbAutoCrib1 < 2) {
            // send card to crib
            crib1Ref.push().set(hand[key]);
            val.fbAutoCrib1++;
            autoCribRef.child('fbAutoCrib1').set(val.fbAutoCrib1)
            // console.log('fbAutoCrib1: ' + val.fbAutoCrib1);
          } else {
            // send card to player's pot
            count1Ref.push().set(hand[key]);
            // console.log('wrong card');
            // update the count on both screens
            updateCount(value);
          }
        } else {
          // if card does not match clicked card, add it to new hand
          newHand[key] = hand[key];
          // console.log('wrong card added to new hand');
        }
      }
      player1Ref.set(newHand);
      // console.log('player 1 set new FB hand');
    })
  })
  // set the new firebase hand, sans card that was clicked
})

// Same for player 2 element
player2El.addEventListener('click', (e)=>{

  //get nearest card element to the target
  let card = e.target.closest('div.card');
  let newHand = {};
  // console.log(card);
  //get the suit and card value for the card that was clicked
  let suit = card.classList[1];
  let value = card.querySelector('span').innerHTML;
  // console.log(typeof value);

  card.remove()
  //get a snapshot of the player's hand search it for the
  //corresponding card that was clicked
  player2Ref.once('value', (snap)=>{
    let hand = snap.val();
    
    autoCribRef.once('value', (snap) => {
      let val = snap.val();
      
      for (key in hand) {
        // grab the suit and value of the key being checked
        let fbSuit = hand[key]['suit'];
        let fbValue = hand[key]['value'];
  
        //check if the fb card matches the card clicked
        if (fbSuit === suit && fbValue.toString() === value) {
          // executes if the crib radio is selected
          if(val.fbAutoCrib2 < 2) {
            crib2Ref.push().set(hand[key]);
            val.fbAutoCrib2++;
            autoCribRef.child('fbAutoCrib2').set(val.fbAutoCrib2);
            // console.log('fbAutoCrib2: ' + val.fbAutoCrib2);
          } else {
            count2Ref.push().set(hand[key]);
            updateCount(value);
          }
        } else {
          // console.log('wrong card');
          newHand[key] = hand[key];
        } 
      }
      player2Ref.set(newHand);
    })
    // console.log(hand);
    //iterate through the cards in the hand and find the one that was clicked
    
  })
  // set the new firebase hand

})


function updateCount(cardVal) {
  let currentCount = parseInt(countEl.innerHTML);
  let parsedVal = 0;
  // console.log('current count: ' + currentCount);
  // if (document.querySelector('input[name="cribPotRadio"]:checked').value === 'pot') {
    if(cardVal == 'J' || cardVal == 'Q' || cardVal == 'K') {
      parsedVal += 10;
      currentCount += 10;
    } else if (cardVal == 'A') {
      parsedVal += 1;
      currentCount += 1;
    } else {
      parsedVal += parseInt(cardVal);
      currentCount += parseInt(cardVal);
    }
  // }

  (currentCount > 31) ? counterRef.set(parsedVal) : counterRef.set(currentCount);
}

// tell user the game works better in landscape mode
function detectLandscape() {
  if (window.innerWidth < window.innerHeight) {
    alert('This game works best with your phone in landscape mode!');
  }
}

detectLandscape();

/*
lucky semicolon, don't touch
;
*/