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

  constructor(
      Id: number, FirstName: string, LastName: string, Email: string,
      Phone: string, Address: string, Country: string, Password: string | null, Verified: boolean
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
  }
}
