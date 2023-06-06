<template>
  <h3>Information</h3>
  <ul>
    <li>The game involves a deck of thirty cards.</li>
    <li>Each card is hidden, you do not know it's value.</li>
    <li>You start the game with <strong>£100</strong></li>
    <li>
      You can bet that the next card is higher or lower than the previous card.
    </li>
    <li>
      If you are right, your bet is doubled and returned back to your balance.
    </li>
    <li>
      Cards with a <strong>*</strong> next to their number are bonus cards,
      these cards quadruple your bet.
    </li>
    <li>
      When the cards are equal, they are compared by their upper or lower decks:
      <ul>
        <li>
          <div class="row">
            <div class="upper-deck-example"></div>
            means the card is in the upper deck.
          </div>
        </li>
        <li>
          <div class="row">
            <div class="lower-deck-example"></div>
            means the card is in the lower deck.
          </div>
        </li>
      </ul>
    </li>
  </ul>
  <button @click="$emit('startGame')">Start Game</button>
</template>

<style scoped>
.row {
  align-items: center;
  /* Disable margin on the original row class just for this component. */
  margin: 0;
}

/* 
  Some little patches of colour indicating the key
  for upper and lower deck.
*/

.lower-deck-example {
  width: 32px;
  height: 8px;
  background-color: #b1ff9c;
}

.upper-deck-example {
  width: 32px;
  height: 8px;
  background-color: #ffa39e;
}
</style>
