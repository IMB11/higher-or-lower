import type Bet from "./bet";
import Card from "./card";

export enum GameStage {
  Welcome = "welcome",
  PlayerCreation = "player-creation",
  Gameplay = "gameplay",
  GameOver = "gameover"
}

export default class Game {
  private currentStage: GameStage;

  private currentCard: Card;
  private previousCard: Card;
  private money: number;

  private cards: Card[];

  // currentBetInformation and playerName are public because
  // they need to be binded to input boxes
  public currentBetInformation: Bet = {
    nextCardHigher: false,
    wonPrevious: false,
    value: 0
  };
  public playerName: string;

  private canPlayerBet: boolean;

  constructor(_sizeOfDeck: number) {
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
      for (let cardNumber = 0; cardNumber < _sizeOfDeck / 2; cardNumber++) {
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
