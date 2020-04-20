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

//set the player hands to empty on page load
player1Ref.set({player1Cards:[]});
player2Ref.set({player2Cards:[]});

//create card class
class Card {
  constructor(suit, value){
    this.suit = suit;
    this.value = value;
  }
}

//create deck
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
// console.log(cardDeck);
//
// //set cardDeck into Firebase
// deckRef.set(cardDeck);

//make player hands
let player1Hand = [];
let player2Hand = [];
let turn = true;

//get player hands html elements
let player1El = document.querySelector('.player1');
let player2El = document.querySelector('.player2');
let dealButton = document.querySelector('#dealEl');
let resetButton = document.querySelector('#resetEl');

// let showButton1 = document.querySelector('.show-hand-1');
// let showButton2 = document.querySelector('.show-hand-2');

let $player1El = $('.player1');
let $player2El = $('.player2');
let $showButton1 = $('.show-hand-1');
let $showButton2 = $('.show-hand-2');

$showButton1.click(()=>{$player1El.toggleClass('hide')});
$showButton2.click(()=>{$player2El.toggleClass('hide')});

dealButton.addEventListener('click', deal);


function deal(){
  deckRef.once('value', (snap)=>{
    let fbDeck = snap.val();
    let fbCard = fbDeck.shift();
    deckRef.set(fbDeck);
    // console.log(fbCard.suit);

    if(turn){
      player1Ref.push().set(fbCard);
      turn = false;
    } else {
      player2Ref.push().set(fbCard);
      turn = true;
    }
  });
};

//listen for change in value of player 1 hand
player1Ref.on('value', (snap)=>{
  let hand = snap.val();
  //reset the players hand element
  player1El.innerHTML='';
  getFBHand(player1El, hand);
});

//listen for change in value of player 2 hand
player2Ref.on('value', (snap)=>{
  let hand = snap.val();
  //reset player hand element
  player2El.innerHTML='';
  getFBHand(player2El, hand);
})

//this runs every tme there is a change in a player's hand in the database
//for each key in hand, create HTML element and append to hand element
function getFBHand(handEl, hand){
  for(key in hand){
    let suit = hand[key].suit;
    let value = hand[key].value;
    let cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.classList.add(suit);
    cardEl.innerHTML =
      `<span class="${value}">${value}</span><br>
       <span class="${suit}">${suit}</span>`;
    handEl.appendChild(cardEl);
  }
}

/*



*/
