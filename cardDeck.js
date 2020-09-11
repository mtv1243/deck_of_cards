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

//set the player hands to empty on page load
player1Ref.set({player1Cards:[]});
player2Ref.set({player2Cards:[]});
count1Ref.set({count:[]});
count2Ref.set({count:[]});
crib1Ref.set({crib:[]});
crib2Ref.set({crib:[]});
starterRef.set({starter:[]})

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

// let showButton1 = document.querySelector('.show-hand-1');
// let showButton2 = document.querySelector('.show-hand-2');

//get button elements
let dealButton = document.querySelector('#dealEl');
let resetButton = document.querySelector('#resetEl');

let $showButton1 = $('.show-hand-1');
let $showButton2 = $('.show-hand-2');
let $cribButton1 = $('.show-crib-1');
let $cribButton2 = $('.show-crib-2');

$showButton1.click(()=>{$player1El.toggleClass('hide')});
$showButton2.click(()=>{$player2El.toggleClass('hide')});
$cribButton1.click(()=>{$player1Crib.toggleClass('hide')});
$cribButton2.click(()=>{$player2Crib.toggleClass('hide')});


resetButton.addEventListener('click', (e) => {
  e.preventDefault();

  //set the player hands to empty on page load
  player1Ref.set({player1Cards:[]});
  player2Ref.set({player2Cards:[]});
  count1Ref.set({count:[]});
  count2Ref.set({count:[]});
  crib1Ref.set({crib:[]});
  crib2Ref.set({crib:[]});
  starterRef.set({starter:[]})

  // create a new deck and shuffle it
  cardDeck = new Deck();
  cardDeck.createDeck(suits, values);
  cardDeck.shuffle();

  // reset the player hand arrays and the turn boolean
  player1Hand = [];
  player2Hand = [];
  turn = true;
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
  let val = document.querySelector('input[name="radiogroup1"]:checked').value;

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
  let val = document.querySelector('input[name="radio-group"]:checked').value;

  if(val === 'pot') {
    player2PotEl.innerHTML = '';
    getFBHand(player2PotEl, hand);
  } else if(val === 'crib') {
    player2CribEl.innerHTML = '';
    getFBHand(player2CribEl, hand)
  }
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
  // console.log(card);
  //get the suit and card value for the card that was clicked
  let suit = card.classList[1];
  let value = card.querySelector('span').innerHTML;
  console.log(suit, value);

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
      let val = document.querySelector('input[name="radiogroup1"]:checked').value;

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
        console.log('wrong card');
      } 
    }
  })
})

// Same for player 2 element
player2El.addEventListener('click', (e)=>{
  //get nearest card element to the target
  let card = e.target.closest('div.card');
  // console.log(card);
  //get the suit and card value for the card that was clicked
  let suit = card.classList[1];
  let value = card.querySelector('span').innerHTML;
  console.log(suit, value);

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
      let val = document.querySelector('input[name="radio-group"]:checked').value;

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
        console.log('wrong card');
      } 
    }
  })
})



/*



*/