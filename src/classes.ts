

interface Bet {
  nextCardHigher: boolean
  value: number
}

class Player {
  private currentCard: Card | undefined;
  private previousCard: Card | undefined;
  private hand: Card[];
  private money: number;
  private currentBet: Bet | undefined;
  private name: string;
  private game: any;

  constructor(_game: any, _name: string, _hand: Card[]) {
    this.money = 100.0;
    this.hand = _hand;
    this.name = _name;
    this.game = _game;
  }

  public getName(): string {
    return this.name;
  }

  public turnNextCard(): void {
    this.previousCard = this.currentCard;
    this.currentCard = this.hand.pop();

    if (this.currentCard == undefined) {
      alert("Player" + this.name + " has reached the end of their deck.");
      this.game.end();
      return;
    }

    this.currentCard?.show();

    this.game.updateDisplay(this);

    if (this.currentBet) {

    }
  }
}

class Game {
  private players: Player[]
  private cards: Card[]
  private shouldStop: boolean = false;
  constructor(_players: number) {
    this.players = []
    this.cards = []

    for (let _ = 0; _ < 2; _++) {
      for (let cardNumber = 1; cardNumber < 16; cardNumber++) {
        const isCardBonus: boolean = Math.random() < 0.1
        const card: Card = new Card(cardNumber, isCardBonus)
        this.cards.push(card)
      }
    }

    alert("There are " + this.cards.length + " cards in the deck.")

    let distributedCards = Array.from({ length:  })

    for (let i = 0; i < _players; i++) {
      const playerName: string = prompt("Player " + i + 1 + " please enter your name.", "Player " + i + 1) ?? "Player " + i + 1;

    }
  }

  public updateHTML(elementID: string, _value: string) {
    const element = document.getElementById(elementID);
    if (element) {
      element.innerHTML = _value;
    }
  }

  public start(): void {
    alert("Starting game.")
    while (!this.shouldStop) {
      // alert("Round 1")
      for (const player of this.players) {
        if (this.shouldStop) break;
        alert(player.getName)
        this.updateHTML("currentPlayerName", player.getName())

        player.turnNextCard()
      }
    }
  }

  public end(): void {
    this.shouldStop = true;
  }
}