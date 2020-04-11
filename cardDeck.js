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
const deckRef = DeckReference.ref('deckoCards');
const player1Ref = DeckReference.ref('player1Hand');
const player2Ref = DeckReference.ref('player2Hand');


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
console.log(cardDeck);

//set cardDeck into Firebase
deckRef.set(cardDeck);

//make player hands
let player1Hand = [];
let player2Hand = [];
let turn = true;

//get player hands html elements
let player1El = document.querySelector('.player1');
let player2El = document.querySelector('.player2');
let dealButton = document.querySelector('#dealEl');
let resetButton = document.querySelector('#resetEl');


deckRef.on('value', (snapshot)=>{
  //deal a card on click dealButton
  dealButton.addEventListener('click', deal);

  //reset on click Reset button
  resetButton.addEventListener('click', reset);
})

//alternate dealing cards to each player
function deal(){
  if(turn){
    generateCard(player1Hand, player1El);
    player1Ref.set(player1Hand);
    deckRef.set(cardDeck);
    turn = false;
    return player1Hand;
  } else {
    generateCard(player2Hand ,player2El);
    player2Ref.set(player2Hand);
    deckRef.set(cardDeck);
    turn = true;
    return player2Hand;
  }
}

//deal a card from the deck
function generateCard(playerHand, playerHandEl) {
  let dealtCard = cardDeck.deal(1);
  let dealtCardVal = dealtCard[0].value;
  let dealtCardSuit = dealtCard[0].suit;

  playerHand.push(dealtCard);
  let cardEl = document.createElement('span');
  cardEl.classList.add('card', dealtCardSuit);
  cardEl.innerHTML = `${dealtCardVal} of ${dealtCardSuit}`;
  playerHandEl.appendChild(cardEl);
  console.log(cardEl);
}

//reset function
function reset(){
  cardDeck = new Deck();
  cardDeck.createDeck(suits, values);
  cardDeck.shuffle();
  console.log(cardDeck);

  //set cardDeck into Firebase
  deckRef.set(cardDeck);

  //reset player hands
  player1Hand = [];
  player1Ref.set('');

  player2Hand = [];
  player2Ref.set('');
}

/*
======= DEALING ===========
determine whose turn it is to get a card
remove card from deck
push card into the hand
  -create variables for suit and value
  -create an element to hold the card
  -populate the element with suit and value
  -appendChild the element into the DOM
push the card into the hand
switch turns

========== PLAY =============
player reveals hand
chooses card to play
card(s) enter pool
fifteens found
points added to scores
*/
