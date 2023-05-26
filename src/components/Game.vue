<script lang="ts">
import { defineComponent } from "vue";

interface Bet {
  nextCardHigher: boolean;
  wonPrevious: boolean;
  value: number;
}

class Card {
  value: number;
  bonus: boolean;
  id: number;
  hidden: boolean = true;

  constructor(_value: number, _bonus: boolean, _id: number) {
    this.value = _value;
    this.id = _id;
    this.bonus = _bonus;
  }

  public getValue(): number | undefined {
    return this.hidden ? undefined : this.value;
  }

  public isBonus(): boolean | undefined {
    return this.hidden ? undefined : this.bonus;
  }

  public show(): void {
    this.hidden = false;
  }
}

interface Game {
  currentStage: "none" | "player-creation" | "gameplay" | "game-over";
  currentCard: Card | undefined;
  previousCard: Card | undefined;
  money: number;
  cards: any[];
  currentBet: Bet;
  playerName: string;
  canPlayerBet: boolean
  index: number
}

function shuffle(array: any[]): any[] {
  for (let index = 0; index < 5; index++) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }

  return array;
}

export default defineComponent({
  data: function (): Game {
    return {
      currentStage: "none",
      currentCard: undefined,
      previousCard: undefined,
      playerName: "Player",
      money: 100,
      cards: [],
      currentBet: {
        value: -1,
        wonPrevious: false,
        nextCardHigher: false
      },
      canPlayerBet: false,
      index: 0,
    };
  },
  methods: {
    setPlayerName(): void {
      this.currentStage = "gameplay";
    },
    continueAfterWinningBet(): void {
      this.currentBet.wonPrevious = false;
      this.canPlayerBet = true;
    },
    showNextCard(): void {
      this.previousCard = this.currentCard;
      this.currentCard = this.cards.pop();

      if (this.currentBet.value != -1 && this.currentCard && this.previousCard) {
        if (this.currentCard.value > this.previousCard.value && this.currentBet.nextCardHigher) {
          if (this.previousCard.bonus) {
            this.currentBet.value *= 4;
          } else {
            this.currentBet.value *= 2;
          }

          this.money += this.currentBet.value;
          this.currentBet.wonPrevious = true;

          if (this.money < 1 || this.cards.length == 0) {
            this.currentStage = "game-over"
            this.cards.forEach(card => card.show())
            return;
          }

          return;
        }
        if (this.currentCard.value < this.previousCard.value && !this.currentBet.nextCardHigher) {
          if (this.previousCard.bonus) {
            this.currentBet.value *= 4;
          } else {
            this.currentBet.value *= 2;
          }

          this.money += this.currentBet.value;
          this.currentBet.wonPrevious = true;

          if (this.money < 1 || this.cards.length == 0) {
            this.currentStage = "game-over"
            this.cards.forEach(card => card.show())
            return;
          }

          return;
        }
      }

      if (this.money < 1 || this.cards.length == 0) {
        this.currentStage = "game-over"
        this.cards.forEach(card => card.show())
        return;
      }

      this.canPlayerBet = true;
      this.currentBet.value = 1;
    },
    submitBet(): void {
      this.money -= this.currentBet.value;
      this.canPlayerBet = false;
    },
    startGame(): void {
      this.currentStage = "player-creation";

      for (let iteration = 0; iteration < 2; iteration++) {
        for (let cardNumber = 1; cardNumber < 16; cardNumber++) {
          const isCardBonus: boolean = Math.random() < 0.1;
          const card = new Card(
            cardNumber,
            isCardBonus,
            iteration + cardNumber
          );
          this.cards.push(card);
        }
      }

      shuffle(this.cards)

      this.cards.reverse();
    },
  },
});
</script>

<template>
  <div v-if="currentStage === 'gameplay'">
    <h3>Cards left in deck - {{ cards.length }}</h3>
    <h3>Your balance - £{{ money }}</h3>
    <transition-group class="deck" name="player" tag="div">
      <div v-for="card in cards.slice().reverse()">
        <div class="card" v-if="card.hidden">
          <small>{{ cards.indexOf(card) }}</small>
          <h1>?</h1>
        </div>
        <div class="card" v-else>
          <h1>{{ card.value }}{{ card.bonus ? "*" : "" }}</h1>
        </div>
      </div>
    </transition-group>
    <div class="deck">
      <div class="deck">
        <div>
          <h4>Previous Card</h4>
          <div class="card" v-if="previousCard">
            <h1>{{ previousCard.value }}{{ previousCard.bonus ? "*" : "" }}</h1>
          </div>
          <div class="card" v-else></div>
        </div>
        <div>
          <h4>Current Card</h4>
          <div class="card" v-if="currentCard">
            <h1>{{ currentCard.value }}{{ currentCard.bonus ? "*" : "" }}</h1>
          </div>
          <div class="card" v-else></div>
        </div>
      </div>
      <div v-if="canPlayerBet">
        <h4>Bet</h4>
        <p>Enter a bet that the next card is higher or lower...</p>
        <h5>Bet Amount</h5>
        <input v-model="currentBet.value" min="1" :max="money" type="number" />
        <h5>Higher Or Lower?</h5>
        <div class="higherLowerToggle">
          Lower<label class="switch">
            <input v-model="currentBet.nextCardHigher" type="checkbox">
            <span class="slider"></span>
          </label>
          Higher
        </div>
        <br />
        <button @click="submitBet">Submit Bet</button>
      </div>

      <div v-if="!canPlayerBet && currentBet.value != -1">
        <div v-if="currentBet.wonPrevious">
          <h4>You won your bet!</h4>
          <p>You bet that the next card will be <strong>{{
            currentBet.nextCardHigher ? 'higher' : 'lower' }}</strong>.</p>
          <p><strong>£{{ currentBet.value }}</strong> has been added into your balance.</p>
          <button @click="continueAfterWinningBet">Continue</button>
        </div>
        <div v-else>
          <h4>Current Bet</h4>
          <p>You bet <strong>£{{ currentBet.value }}</strong> that the next card will be <strong>{{
            currentBet.nextCardHigher ? 'higher' : 'lower' }}</strong>.</p>
        </div>

      </div>
    </div>
    <button v-if="!canPlayerBet && !currentBet.wonPrevious" @click="showNextCard">Show Next Card</button>
  </div>
  <div v-if="currentStage === 'none'">
    <h3>Information</h3>
    <ul>
      <li>The game involves a deck of thirty cards.</li>
      <li>Each card is hidden, you do not know it's value.</li>
      <li>You start the game with <strong>£100</strong></li>
      <li>You can bet that the next card is higher or lower than the previous card.</li>
      <li>If you are right, your bet is doubled and returned back to your balance.</li>
      <li>Cards with a <strong>*</strong> next to their number are bonus cards, these cards quadruple your bet.</li>
    </ul>
    <button @click="startGame">Start Game</button>
  </div>
  <div v-if="currentStage === 'player-creation'">
    <p>Please enter your name.</p>
    <input v-model="playerName" type="text" />
    <button @click="setPlayerName">Continue</button>
  </div>
  <div v-if="currentStage === 'game-over'">
    <h3>Game Over</h3>
    <div v-if="cards.length == 0">
      <p>You emptied the deck!</p>
      <p>Your final balance was <strong>£{{ money }}</strong></p>
    </div>
    <div v-else>
      <p>You ran out of money...</p>
      <p>You had <strong>{{ cards.length }}</strong> cards left in the deck.</p>
      <h4>Deck</h4>
      <transition-group class="deck" name="player" tag="div">
        <div v-for="card in cards.slice().reverse()">
          <div class="card-dead">
            <h1>{{ card.getValue() }}</h1>
          </div>
        </div>
      </transition-group>
      <div class="deck">
        <div>
          <h4>Previous Card</h4>
          <div class="card" v-if="previousCard">
            <h1>{{ previousCard.value }}{{ previousCard.bonus ? "*" : "" }}</h1>
          </div>
          <div class="card" v-else></div>
        </div>
        <div>
          <h4>Current Card</h4>
          <div class="card" v-if="currentCard">
            <h1>{{ currentCard.value }}{{ currentCard.bonus ? "*" : "" }}</h1>
          </div>
          <div class="card" v-else></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck::after {
  content: "";
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  bottom: 15px;
  pointer-events: none;
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0), white 85%);
  width: 15%;
}

.deck {
  display: flex;
  overflow-x: hidden;
  gap: 0.5rem;
  transition: all 1s;
  margin-bottom: 2rem;
}

.card {
  transition: 0.2s;
  display: flex;
  width: 120px;
  border-color: black;
  border-style: solid;
  height: 190px;
}

.card-dead {
  border-color: black;
  border-style: solid;
  display: flex;
  width: 60px !important;
  height: 95px !important; 
}

.card>h1,
.card>h2,
.card>h3,
.card-dead>h1,
.card-dead>h2,
.card-dead>h3 {
  text-align: center;
  margin: auto;
}

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
}

input:checked+.slider {
  background-color: #2196F3;
}

input:focus+.slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.player-enter,
.player-leave-to {
  opacity: 0;
}

.player-enter-active,
.player-leave-active {
  transition: all 1s ease;
}
</style>
