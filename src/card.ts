export default class Card {
  private value: number;
  private bonus: boolean;
  private isUpperDeck: boolean;
  private hidden: boolean = true;

  constructor(_value: number, _bonus: boolean, _isUpperDeck: boolean) {
    this.value = _value;
    this.bonus = _bonus;
    this.isUpperDeck = _isUpperDeck;
  }

  public getValue(): number {
    return this.value;
  }

  public isHidden(): boolean {
    return this.hidden;
  }

  public isFromUpperDeck(): boolean {
    return this.isUpperDeck
  }

  public isBonus(): boolean {
    return this.bonus;
  }

  public show(): void {
    this.hidden = false;
  }
}