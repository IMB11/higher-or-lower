<script lang="ts">
import type Bet from "../bet";
import Card from "../card";

import {Component, Vue} from 'vue-facing-decorator'

enum GameStage {
  Welcome = "welcome",
  PlayerCreation = "player-creation",
  Gameplay = "gameplay",
  GameOver = "gameover"
}

@Component({})
export default class Game extends Vue {
  private currentStage!: GameStage;

  private currentCard!: Card;
  private previousCard!: Card;
  private money!: number;

  private cards!: Card[];

  // currentBetInformation and playerName are public because
  // they need to be binded to input boxes
  public currentBetInformation: Bet = {
    nextCardHigher: false,
    wonPrevious: false,
    value: 0
  };
  public playerName!: string;

  private canPlayerBet!: boolean;

  mounted() {
    const totalAmountOfCards = 30;

    // Initialize all the nessecary information for the
    // game to start.
    this.playerName = "Player"
    this.cards = [];
    this.canPlayerBet = false;
    this.money = 100;

    // A card of -1 is used to show that the variable isn't being used.
    this.previousCard = new Card(-1, false, false);
    this.currentCard = new Card(-1, false, false);

    this.currentStage = GameStage.Welcome;

    // Create two decks of cards, each containing 15 cards and a 2 in 10 chance of
    // being a bonus card.
    for (let deckLevel = 0; deckLevel < 2; deckLevel++) {
      const isUpperDeck = deckLevel == 1;
      for (let cardNumber = 0; cardNumber < totalAmountOfCards / 2; cardNumber++) {
        const isCardBonus = (Math.floor(Math.random() * 10) < 2);
        const card = new Card(cardNumber, isCardBonus, isUpperDeck)
        this.cards.push(card);
      }
    }

    // Shuffle all the cards together.
    this.shuffleCards();
  }

  private handleBetWin() {
    // If the card is a bonus, quadruple the bet.
    if (this.previousCard.isBonus()) {
      this.currentBetInformation.value *= 4;
    } else {
      this.currentBetInformation.value *= 2;
    }

    // Add the new calculated bet to the player's balance.
    this.money += this.currentBetInformation.value;

    // State that the player won the bet, this shows the "You Won Your Bet!"
    // with information on the winnings.
    this.currentBetInformation.wonPrevious = true;

    return;
  }

  public showNextCard(): void {
    this.previousCard = this.currentCard;
    // A card of -1 is used to show that the variable isn't being used.
    this.currentCard = this.cards.pop() ?? new Card(-1, false, false);

    // Ensure that a current and previous card actually exist.
    if (this.getCurrentBetValue() != -1 && this.hasCurrentCard() && this.hasPreviousCard()) {
      // If the user bet the next card is higher, and it is higher - handle the bet as a win.
      if (this.currentCard.getValue() > this.previousCard.getValue() && this.currentBetInformation.nextCardHigher) {
        this.handleBetWin()
      }

      // If the user bet the next card is lower, and it is lower - handle the bet as a win.
      if (this.currentCard.getValue() < this.previousCard.getValue() && !this.currentBetInformation.nextCardHigher) {
        this.handleBetWin();
      }

      // If there is no money left, or there are no cards left, end the game
      // and reveal any cards that were left.
      if (this.money < 1 || this.cards.length == 0) {
        this.currentStage = GameStage.GameOver;
        this.cards.forEach(card => card.show())
        return;
      }
    }
  }

  public startGame(): void {
    this.currentStage = GameStage.PlayerCreation;
  }

  public continueAfterWinningBet(): void {
    this.currentBetInformation.wonPrevious = false;
    this.canPlayerBet = true;
  }

  public submitBet(): void {
    this.money -= this.currentBetInformation.value;
    this.canPlayerBet = false;
  }

  public canPlayerCreateBet(): boolean {
    return this.canPlayerBet;
  }

  public getCurrentStage(): GameStage {
    return this.currentStage;
  }

  public getCards(): Card[] {
    return this.cards;
  }

  public getMoney(): number {
    return this.money;
  }

  public hasPreviousCard(): boolean {
    return this.previousCard.getValue() != -1;
  }

  public hasCurrentCard(): boolean {
    return this.currentCard.getValue() != -1;
  }

  public getPreviousCard(): Card {
    return this.previousCard;
  }

  public getCurrentCard(): Card {
    return this.currentCard;
  }

  public getCurrentBetValue(): number {
    return this.currentBetInformation.value;
  }

  public haveWonPreviousBet(): boolean {
    return this.currentBetInformation.wonPrevious;
  }

  public hasBetNextCardHigher(): boolean {
    return this.currentBetInformation.nextCardHigher;
  }

  public setPlayerName(_name: string): void {
    this.playerName = _name;
    this.currentStage = GameStage.Gameplay;
  }

  private shuffleCards() {
    for (let index = 0; index < 5; index++) {
      let currentIndex = this.cards.length,
        randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [this.cards[currentIndex], this.cards[randomIndex]] = [
          this.cards[randomIndex],
          this.cards[currentIndex],
        ];
      }
    }
  }
}

</script>

<template>
  <div v-if="getCurrentStage() == 'welcome'">
    <h3>Cards left in deck - {{ getCards().length }}</h3>
    <h3>Your balance - £{{ getMoney() }}</h3>
    <div class="deck">
      <div class="deck">
        <div>
          <h4>Previous Card</h4>
          <div v-if="hasPreviousCard()">
            <h1>
              {{ getPreviousCard().getValue()
              }}{{ getPreviousCard().isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div class="card" v-else></div>
        </div>
        <div>
          <h4>Current Card</h4>
          <div class="card" v-if="hasCurrentCard()">
            <h1>
              {{ getCurrentCard().getValue()
              }}{{ getCurrentCard().isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div class="card" v-else></div>
        </div>
      </div>
      <div v-if="canPlayerCreateBet()">
        <h4>Bet</h4>
        <p>Enter a bet that the next card is higher or lower...</p>
        <h5>Bet Amount</h5>
        <!-- 
          currentBetInformation has to be public to allow Vue to bind this input box to the variable.
        -->
        <input
          v-model="currentBetInformation.value"
          min="1"
          :max="getMoney()"
          type="number"
        />
        <h5>Higher Or Lower?</h5>
        <div class="higherLowerSelection">
          <div>
            <!-- 
              currentBetInformation has to be public to allow Vue to bind this input box to the variable.
            -->
            <input
              id="isCardHigherCheckbox"
              v-model="currentBetInformation.nextCardHigher"
              type="checkbox"
            />
            <label for="isCardHigherCheckbox"> Higher </label>
          </div>
          <div>
            <!-- 
              currentBetInformation has to be public to allow Vue to bind this input box to the variable.
            -->
            <input
              id="isCardLowerCheckbox"
              :true-value="false"
              :false-value="true"
              v-model="currentBetInformation.nextCardHigher"
              type="checkbox"
            />
            <label for="isCardLowerCheckbox"> Lower </label>
          </div>
        </div>
        <br />
        <button @click="submitBet">Submit Bet</button>
      </div>

      <div v-if="!canPlayerCreateBet() && getCurrentBetValue() != -1">
        <div v-if="haveWonPreviousBet()">
          <h4>You won your bet!</h4>
          <p>
            You bet that the next card will be
            <strong>{{ hasBetNextCardHigher() ? "higher" : "lower" }}</strong
            >.
          </p>
          <p>
            <strong>£{{ getCurrentBetValue() }}</strong> has been added into
            your balance.
          </p>
          <button @click="continueAfterWinningBet">Continue</button>
        </div>
        <div v-else>
          <h4>Current Bet</h4>
          <p>
            You bet <strong>£{{ getCurrentBetValue() }}</strong> that the next
            card will be
            <strong>{{ hasBetNextCardHigher() ? "higher" : "lower" }}</strong
            >.
          </p>
        </div>
      </div>
    </div>
    <button
      v-if="!canPlayerCreateBet() && !haveWonPreviousBet()"
      @click="showNextCard()"
    >
      Show Next Card
    </button>
  </div>
  <div v-if="getCurrentStage() === 'welcome'">
    <h3>Information</h3>
    <ul>
      <li>The game involves a deck of thirty cards.</li>
      <li>Each card is hidden, you do not know it's value.</li>
      <li>You start the game with <strong>£100</strong></li>
      <li>
        You can bet that the next card is higher or lower than the previous
        card.
      </li>
      <li>
        If you are right, your bet is doubled and returned back to your balance.
      </li>
      <li>
        Cards with a <strong>*</strong> next to their number are bonus cards,
        these cards quadruple your bet.
      </li>
    </ul>
    <button @click="startGame()">Start Game</button>
  </div>
  <div v-if="getCurrentStage() === 'player-creation'">
    <p>Please enter your name.</p>
    <input v-model="playerName" type="text" />
    <button @click="setPlayerName(playerName)">Continue</button>
  </div>
  <div v-if="getCurrentStage() === 'gameover'">
    <h3>Game Over</h3>
    <div v-if="getCards().length == 0">
      <p>You emptied the deck!</p>
      <p>
        Your final balance was <strong>£{{ getMoney() }}</strong>
      </p>
    </div>
    <div v-else>
      <p>You ran out of money...</p>
      <p>
        You had <strong>{{ getCards().length }}</strong> cards left in the deck.
      </p>
      <div class="card-row">
        <div>
          <h4>Previous Card</h4>
          <div
            :class="`card ${
              getPreviousCard().isFromUpperDeck() ? 'card-upper-deck' : ''
            }`"
            v-if="hasPreviousCard()"
          >
            <h1>
              {{ getPreviousCard().getValue()
              }}{{ getPreviousCard().isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div class="card" v-else>N/A</div>
        </div>
        <div>
          <h4>Current Card</h4>
          <div
            :class="`card ${
              getCurrentCard().isFromUpperDeck() ? 'card-upper-deck' : ''
            }`"
            v-if="hasCurrentCard()"
          >
            <h1>
              {{ getCurrentCard().getValue()
              }}{{ getCurrentCard().isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div class="card" v-else>N/A</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: 0.2s;
  display: flex;
  width: 120px;
  border-color: black;
  background-color: #b1ff9c;
  border-style: solid;
  height: 190px;
}

.card-upper-deck {
  background-color: #ffa39e;
}

.card > h1,
.card > h2,
.card > h3 {
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
</style>
