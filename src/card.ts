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

  public isFromHigherDeck(_otherCard: Card): boolean {
    // If this card is from the upper deck, and the other card isn't, return true.
    return !_otherCard.isFromUpperDeck() && this.isFromUpperDeck()
  }

  public isCardHigher(_otherCard: Card): boolean {
    // If this card value is greater than the other card's value.
    // OR if the values are the same and this card is from a higher deck.
    return this.getValue() > _otherCard.getValue() || (this.getValue() == _otherCard.getValue() && this.isFromHigherDeck(_otherCard))
  }

  public isCardLower(_otherCard: Card): boolean {
    // If this card value is less than the other card's value.
    // OR if the values are the same and this card is from a lower deck.
    return this.getValue() < _otherCard.getValue() || (this.getValue() == _otherCard.getValue() && !this.isFromHigherDeck(_otherCard))
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