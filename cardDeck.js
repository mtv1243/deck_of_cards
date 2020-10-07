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
let DeckReference = firebase.database();
let deckRef = DeckReference.ref('deckoCards');
let player1Ref = DeckReference.ref('player1Hand');
let player2Ref = DeckReference.ref('player2Hand');
let count1Ref = DeckReference.ref('count1');
let count2Ref = DeckReference.ref('count2');
let crib1Ref = DeckReference.ref('crib1');
let crib2Ref = DeckReference.ref('crib2');
let starterRef = DeckReference.ref('starter');
let scoreboardRef = DeckReference.ref('scoreboard');
let cribPotRadioRef = DeckReference.ref('cribPot'); 
let counterRef = DeckReference.ref('counter');

//set the player hands to empty on page load
player1Ref.set({player1Cards:[]});
player2Ref.set({player2Cards:[]});
count1Ref.set({count:[]});
count2Ref.set({count:[]});
crib1Ref.set({crib:[]});
crib2Ref.set({crib:[]});
starterRef.set({starter:[]})
scoreboardRef.set({score1: 0, score2: 0});
cribPotRadioRef.set({value: 'crib'});
counterRef.set(0);

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
let player1Hand = [];
let player2Hand = [];
let turn = true;

//get player hands html elements
let player1El = document.querySelector('.player1');
let player2El = document.querySelector('.player2');

let $player1El = $('.player1');
let $player2El = $('.player2');

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
  $player1El.toggleClass('hide');
  $('.hand1-curtain').slideToggle();
});

$showButton2.click(()=>{
  $player2El.toggleClass('hide');
  $('.hand2-curtain').slideToggle();
});

$cribButton1.click(()=>{
  $player1Crib.toggleClass('hide');
  $('.crib1-curtain').slideToggle();
});

$cribButton2.click(()=>{
  $player2Crib.toggleClass('hide')
  $('.crib2-curtain').slideToggle();
});

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

// ========================
// Crib pot radio reference updater
// ========================
document.querySelector('#cribPotForm').addEventListener('click', (e) => {
  // e.preventDefault();
  let val = document.querySelector('input[name="cribPotRadio"]:checked').value;
  cribPotRadioRef.set({value: val});
});

cribPotRadioRef.on('value', (snap) => {
  let val = snap.val();

  // change the corresponding radio when one  is clicked
  if(val.value === 'crib') {
    document.querySelector('#crib-radio').checked = true;
  } else if(val.value === 'pot') {
    document.querySelector('#pot-radio').checked = true;
  }
})

// #crib-radio

//===================================
// Reset all values except scoreboard
// on reset button click
//===================================
resetButton.addEventListener('click', (e) => {
  e.preventDefault();

  //set the player hands to empty on page load
  player1Ref.set({player1Cards:[]});
  player2Ref.set({player2Cards:[]});
  count1Ref.set({count:[]});
  count2Ref.set({count:[]});
  crib1Ref.set({crib:[]});
  crib2Ref.set({crib:[]});
  starterRef.set({starter:[]});
  counterRef.set(0);

  // create a new deck and shuffle it
  cardDeck = new Deck();
  cardDeck.createDeck(suits, values);
  cardDeck.shuffle();

  // reset the player hand arrays and the turn boolean
  player1Hand = [];
  player2Hand = [];
  turn = true;

  //reset the pot elements on click (in case there's a glitch)
  player1PotEl.innerHTML = '';
  player2PotEl.innerHTML = '';

})

//call deal function when click on deal button
dealButton.addEventListener('click', deal);

function deal(){
  deckRef.once('value', (snap)=>{
    let fbDeck = snap.val();
    let fbCard = fbDeck.shift();
    deckRef.set(fbDeck);
    // console.log(fbCard.suit);
    let val = document.querySelector('input[name=master-controls]:checked').value
    
    if(val === 'deal'){
      if(turn){
        player1Ref.push().set(fbCard);
        turn = false;
      } else {
        player2Ref.push().set(fbCard);
        turn = true;
      }
    } else if(val === 'starter') {
      console.log('starter');
      starterRef.push().set(fbCard);
    }
    
  });
};

//listen for change in value of player 1 hand
//then creates an html element with that suit and value
player1Ref.on('value', (snap)=>{
  let hand = snap.val();
  //reset the players hand element
  player1El.innerHTML='';
  getFBHand(player1El, hand);
});

//listen for change in value of player 2 hand
//then creates an html element with that suit and value
player2Ref.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player2El.innerHTML='';
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
  let val = document.querySelector('input[name="cribPotRadio"]:checked').value;

  if(val === 'pot') {
    player1PotEl.innerHTML = '';
    getFBHand(player1PotEl, hand);
  } else if(val === 'crib') {
    player1CribEl.innerHTML = '';
    getFBHand(player1CribEl, hand)
  }
})

count2Ref.on('value', (snap)=>{
  let hand = snap.val();
  let val = document.querySelector('input[name="cribPotRadio"]:checked').value;

  if(val === 'pot') {
    player2PotEl.innerHTML = '';
    getFBHand(player2PotEl, hand);
  } else if(val === 'crib') {
    player2CribEl.innerHTML = '';
    getFBHand(player2CribEl, hand)
  }
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

  // update the count on both screens
  updateCount(value);

  card.remove()
  //get a snapshot of the player's hand search it for the
  //corresponding card that was clicked
  player1Ref.once('value', (snap)=>{
    let hand = snap.val();
    // console.log(hand);
    //iterate through the cards in the hand and find the one that was clicked
    for (key in hand) {
      // grab the suit and value of the key being checked
      let fbSuit = hand[key]['suit'];
      let fbValue = hand[key]['value'];

      // see if card should go to crib or pot
      let val = document.querySelector('input[name="cribPotRadio"]:checked').value;

      //check if the fb card matches the card clicked
      if (fbSuit === suit && fbValue.toString() === value) {
        // executes if the crib radio is selected
        if(val === 'crib') {
          crib1Ref.push().set(hand[key]);

        // executes if the pot radio is selected
        } else if(val === 'pot') {
          count1Ref.push().set(hand[key]);
        }

      } else {
        // console.log('wrong card');
        newHand[key] = hand[key];
      }
    }
    
  })
  // set the new firebase hand
  player1Ref.set(newHand);
  // console.log(newHand);
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

  updateCount(value);

  card.remove()
  //get a snapshot of the player's hand search it for the
  //corresponding card that was clicked
  player2Ref.once('value', (snap)=>{
    let hand = snap.val();
    
    // console.log(hand);
    //iterate through the cards in the hand and find the one that was clicked
    for (key in hand) {
      // grab the suit and value of the key being checked
      let fbSuit = hand[key]['suit'];
      let fbValue = hand[key]['value'];
      // see if card should go to crib or pot
      let val = document.querySelector('input[name="cribPotRadio"]:checked').value;

      //check if the fb card matches the card clicked
      if (fbSuit === suit && fbValue.toString() === value) {
        // executes if the crib radio is selected
        if(val === 'crib') {
          crib2Ref.push().set(hand[key]);

        // executes if the pot radio is selected
        } else if(val === 'pot') {
          count2Ref.push().set(hand[key]);
        }
      } else {
        // console.log('wrong card');
        newHand[key] = hand[key];
      } 
    }
  })
  // set the new firebase hand
  player2Ref.set(newHand);
})


function updateCount(cardVal) {
  let currentCount = parseInt(countEl.innerHTML);
  let parsedVal = 0;
  console.log('current count: ' + currentCount);
  if (document.querySelector('input[name="cribPotRadio"]:checked').value === 'pot') {
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
  }

  (currentCount > 31) ? counterRef.set(parsedVal) : counterRef.set(currentCount);
}


/*
player 2 playing into their crib does not show up for player 1 in DOM
they leave the hand but do not show up in DOM

when opponent plays card into either crib or pot, whatever radio button is checked locally determines where it goes, not what radio button opponent has checked

FIX = 
remove players individual radio buttons and replace with one set connected to firebase that will control where cards go globally

tumbleweed

*/