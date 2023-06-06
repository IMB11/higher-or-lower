<script lang="ts">
import Card from "../card";
import Game, { GameStage } from "../game";

export default {
  data: function (): Game {
    return new Game(30);
  },
  // We need to tell Vue to check the values of these
  // methods constantly by computing them every time the user
  // does something on the webpage.
  computed: {
    ref_getCurrentStage() {
      return this.getCurrentStage();
    },
    ref_hasPreviousCard() {
      return this.hasPreviousCard();
    },
    ref_hasCurrentCard() {
      return this.hasCurrentCard();
    },
    ref_canPlayerCreateBet() {
      return this.canPlayerCreateBet();
    },
    ref_getCurrentBetValue() {
      return this.getCurrentBetValue();
    },
  },
};
</script>

<template>
  <div v-if="ref_getCurrentStage == 'welcome'">
    <h3>Cards left in deck - {{ getCards().length }}</h3>
    <h3>Your balance - £{{ getMoney() }}</h3>
    <div class="deck">
      <div class="deck">
        <div>
          <h4>Previous Card</h4>
          <div v-if="ref_hasPreviousCard">
            <h1>
              {{ getPreviousCard().getValue()
              }}{{ getPreviousCard().isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div class="card" v-else></div>
        </div>
        <div>
          <h4>Current Card</h4>
          <div class="card" v-if="ref_hasCurrentCard">
            <h1>
              {{ getCurrentCard().getValue()
              }}{{ getCurrentCard().isBonus() ? "*" : "" }}
            </h1>
          </div>
          <div class="card" v-else></div>
        </div>
      </div>
      <div v-if="ref_canPlayerCreateBet">
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

      <div v-if="!ref_canPlayerCreateBet && getCurrentBetValue() != -1">
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
  <div v-if="ref_getCurrentStage === 'welcome'">
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
  <div v-if="ref_getCurrentStage === 'player-creation'">
    <p>Please enter your name.</p>
    <input v-model="playerName" type="text" />
    <button @click="setPlayerName(playerName)">Continue</button>
  </div>
  <div v-if="ref_getCurrentStage === 'gameover'">
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
            v-if="ref_hasCurrentCard"
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
