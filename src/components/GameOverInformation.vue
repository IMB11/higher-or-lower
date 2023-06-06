<template>
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
            {{ previousCard.getValue() }}{{ previousCard.isBonus() ? "*" : "" }}
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
</template>

<script lang="ts">
import type Card from "@/card";
import { Component, Vue, Hook, Prop } from "vue-facing-decorator";

@Component({})
export default class GameOverInformation extends Vue {
  // Ensure that cards, currentCard, previousCard and money is passed into the
  // constructor/props of the component.
  @Prop()
  cards!: Card[];
  @Prop()
  currentCard!: Card;
  @Prop()
  hasCurrentCard!: boolean;
  @Prop()
  hasPreviousCard!: boolean;
  @Prop()
  previousCard!: Card;
  @Prop()
  money!: number;
}
</script>
