<script lang="ts">
import type Bet from "../bet";
import Card from "../card";

import { Component, Vue, Hook } from "vue-facing-decorator";

import GameInformation from "./GameInformation.vue";
import BetInput from "./BetInput.vue";

type GameStage = "welcome" | "player-creation" | "gameplay" | "gameover";

@Component({
  // Mark other classes/components here so we aggregate them.
  components: {
    GameInformation,
    BetInput,
  },
})
export default class Game extends Vue {
  currentStage: GameStage = "welcome";

  // A card of -1 is used to show that the variable isn't being used.
  currentCard: Card = new Card(-1, false, true);
  previousCard: Card = new Card(-1, false, true);

  money: number = 100;

  cards: Card[] = [];

  // Cards that the player have taken from the deck already.
  pulledCards: Card[] = [];

  // currentBetInformation and playerName are public because
  // they need to be binded to input boxes
  currentBetInformation: Bet = {
    nextCardHigher: false,
    wonPrevious: false,
    value: -1,
  };

  playerName: string = "Player";
  canPlayerBet: boolean = false;

  // When the webpage is opened, generate the deck of cards.
  // The "mounted" hook is ran when the webpage is opened, similar to window.onload
  @Hook()
  mounted() {
    const totalAmountOfCards = 30;

    // Create two decks of cards, each containing 15 cards and a 2 in 10 chance of
    // being a bonus card.
    for (let deckLevel = 0; deckLevel < 2; deckLevel++) {
      const isUpperDeck = deckLevel == 1;
      for (
        let cardNumber = 0;
        cardNumber < totalAmountOfCards / 2;
        cardNumber++
      ) {
        const isCardBonus = Math.floor(Math.random() * 10) < 2;
        const card = new Card(cardNumber, isCardBonus, isUpperDeck);
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

    if (this.previousCard.getValue() != -1) {
      // If the previous card is an actual card, push it to the pulled deck array.
      this.pulledCards.push(this.previousCard);
    }

    // A card of -1 is used to show that the variable isn't being used.
    this.currentCard = this.cards.pop() ?? new Card(-1, false, false);

    // Ensure that a current and previous card actually exist.
    if (
      this.currentBetInformation.value != -1 &&
      this.hasCurrentCard &&
      this.hasPreviousCard
    ) {
      // If the user bet the next card is higher, and it is higher - handle the bet as a win.
      if (
        this.currentCard.isCardHigher(this.previousCard) &&
        this.currentBetInformation.nextCardHigher
      ) {
        this.handleBetWin();
        return;
      }

      // If the user bet the next card is lower, and it is lower - handle the bet as a win.
      if (
        this.currentCard.isCardLower(this.previousCard) &&
        !this.currentBetInformation.nextCardHigher
      ) {
        this.handleBetWin();
        return;
      }

      // If there is no money left, or there are no cards left, end the game
      // and reveal any cards that were left.
      if (this.money < 1 || this.cards.length == 0) {
        this.currentStage = "gameover";
        this.cards.forEach((card) => card.show());
        return;
      }
    }

    this.canPlayerBet = true;
    this.currentBetInformation.value = 1;
  }

  public startGame(): void {
    this.currentStage = "player-creation";
  }

  public continueAfterWinningBet(): void {
    this.currentBetInformation.wonPrevious = false;
    this.canPlayerBet = true;
  }

  public submitBet(): void {
    this.money -= this.currentBetInformation.value;
    this.canPlayerBet = false;
  }

  public get hasPreviousCard(): boolean {
    return this.previousCard.getValue() != -1;
  }

  public get hasCurrentCard(): boolean {
    return this.currentCard.getValue() != -1;
  }

  public setPlayerName(_name: string): void {
    this.playerName = _name;
    this.currentStage = "gameplay";
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
  <div v-if="currentStage == 'gameplay'">
    <h3>Cards left in deck: {{ cards.length }}</h3>
    <h3>Your balance: £{{ money }}</h3>
    <h4>10-Deck Card History</h4>
    <p>The previous 10 cards that have been pulled from the deck.</p>
    <div class="row">
      <div
        :class="`card ${card.isFromUpperDeck() ? 'card-upper-deck' : ''}`"
        v-for="card in pulledCards"
      >
        <h1>{{ card.getValue() }}{{ card.isBonus() ? "*" : "" }}</h1>
      </div>
    </div>
    <div class="row">
      <!-- Previous and current card. -->
      <div class="row">
        <div>
          <h4>Previous Card</h4>
          <div
            :class="`card ${
              previousCard.isFromUpperDeck() ? 'card-upper-deck' : ''
            }`"
            v-if="hasPreviousCard"
          >
            <h1>
              {{ previousCard.getValue()
              }}{{ previousCard.isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div
            :class="`card ${
              previousCard.isFromUpperDeck() ? 'card-upper-deck' : ''
            }`"
            v-else
          ></div>
        </div>
        <div>
          <h4>Current Card</h4>
          <div
            :class="`card ${
              currentCard.isFromUpperDeck() ? 'card-upper-deck' : ''
            }`"
            v-if="hasCurrentCard"
          >
            <h1>
              {{ currentCard.getValue() }}{{ currentCard.isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div
            :class="`card ${
              currentCard.isFromUpperDeck() ? 'card-upper-deck' : ''
            }`"
            v-else
          ></div>
        </div>
      </div>
      <!-- This is shown when the player can make a bet. -->
      <div v-if="canPlayerBet">
        <h4>Bet</h4>
        <p>Enter a bet that the next card is higher or lower...</p>
        <h5>Bet Amount</h5>
        <!-- 
          currentBetInformation has to be public to allow Vue to bind this input box to the variable.
        -->
        <input
          v-model="currentBetInformation.value"
          min="1"
          :max="money"
          type="number"
        />
        <h5>Higher Or Lower?</h5>
        <div class="higherLowerSelection">
          <div>
            <input
              id="isCardHigherCheckbox"
              v-model="currentBetInformation.nextCardHigher"
              type="checkbox"
            />
            <label for="isCardHigherCheckbox"> Higher </label>
          </div>
          <div>
            <!-- Flip the values of true and false, so when the user
              clicks this checkbox, it unchecks the other, and vice versa.
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

      <div v-if="!canPlayerBet && currentBetInformation.value != -1">
        <div v-if="currentBetInformation.wonPrevious">
          <h4>You won your bet!</h4>
          <p>
            You bet that the next card will be
            <strong>{{
              currentBetInformation.nextCardHigher ? "higher" : "lower"
            }}</strong
            >.
          </p>
          <p>
            <strong>£{{ currentBetInformation.value }}</strong> has been added
            into your balance.
          </p>
          <button @click="continueAfterWinningBet">Continue</button>
        </div>
        <div v-else>
          <h4>Current Bet</h4>
          <p>
            You bet <strong>£{{ currentBetInformation.value }}</strong> that the
            next card will be
            <strong>{{
              currentBetInformation.nextCardHigher ? "higher" : "lower"
            }}</strong
            >.
          </p>
        </div>
      </div>
    </div>
    <button
      v-if="!canPlayerBet && !currentBetInformation.wonPrevious"
      @click="showNextCard()"
    >
      Show Next Card
    </button>
  </div>
  <GameInformation @startGame="startGame" v-if="currentStage == 'welcome'" />
  <div v-if="currentStage == 'player-creation'">
    <p>Please enter your name.</p>
    <input v-model="playerName" type="text" />
    <button @click="setPlayerName(playerName)">Continue</button>
  </div>
  <div v-if="currentStage == 'gameover'">
    <h3>Game Over</h3>
    <div v-if="cards.length == 0">
      <p>You emptied the deck!</p>
      <p>
        Your final balance was <strong>£{{ money }}</strong>
      </p>
    </div>
    <div v-else>
      <p>You ran out of money...</p>
      <p>
        You had <strong>{{ cards.length }}</strong> cards left in the deck.
      </p>
      <div class="card-row">
        <div>
          <h4>Previous Card</h4>
          <div
            :class="`card ${
              previousCard.isFromUpperDeck() ? 'card-upper-deck' : ''
            }`"
            v-if="hasPreviousCard"
          >
            <h1>
              {{ previousCard.getValue()
              }}{{ previousCard.isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div class="card" v-else>N/A</div>
        </div>
        <div>
          <h4>Current Card</h4>
          <div
            :class="`card ${
              currentCard.isFromUpperDeck() ? 'card-upper-deck' : ''
            }`"
            v-if="hasCurrentCard"
          >
            <h1>
              {{ currentCard.getValue() }}{{ currentCard.isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div class="card" v-else>N/A</div>
        </div>
      </div>
    </div>
  </div>
</template>
