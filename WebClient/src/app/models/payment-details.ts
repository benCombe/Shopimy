export class PaymentDetails {
  userId: number;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;

  constructor(
    userId: number,
    cardNumber: string,
    cardHolderName: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string
  ) {
    this.userId = userId;
    this.cardNumber = cardNumber;
    this.cardHolderName = cardHolderName;
    this.expiryMonth = expiryMonth;
    this.expiryYear = expiryYear;
    this.cvv = cvv;
  }
} 