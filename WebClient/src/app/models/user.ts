export class User {
  Id: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Address: string;
  Country: string;
  Password: string | null;
  Verified: boolean;
  City: string;
  State: string;
  PostalCode: string;
  PaymentMethod: string | null;
  LastFourDigits: string | null;
  CardExpiryDate: string | null;
  Subscribed: boolean;
  DOB: string | null;
  DateOfBirth: string | null;

  constructor(
      Id: number, FirstName: string, LastName: string, Email: string,
      Phone: string, Address: string, Country: string, Password: string | null, Verified: boolean,
      City: string = '', State: string = '', PostalCode: string = '',
      PaymentMethod: string | null = null, LastFourDigits: string | null = null, CardExpiryDate: string | null = null,
      Subscribed: boolean = false, DOB: string | null = null
  ) {
      this.Id = Id;
      this.FirstName = FirstName;
      this.LastName = LastName;
      this.Email = Email;
      this.Phone = Phone;
      this.Address = Address;
      this.Country = Country;
      this.Password = Password;
      this.Verified = Verified;
      this.City = City;
      this.State = State;
      this.PostalCode = PostalCode;
      this.PaymentMethod = PaymentMethod;
      this.LastFourDigits = LastFourDigits;
      this.CardExpiryDate = CardExpiryDate;
      this.Subscribed = Subscribed;
      this.DOB = DOB;
      this.DateOfBirth = DOB;
  }
}
