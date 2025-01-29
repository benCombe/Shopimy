export class User {
  Id: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Address: string;
  Region: string;
  Password: string;
  Verified: boolean;

  constructor(
      Id: number, FirstName: string, LastName: string, Email: string,
      Phone: string, Address: string, Region: string, Password: string, Verified: boolean
  ) {
      this.Id = Id;
      this.FirstName = FirstName;
      this.LastName = LastName;
      this.Email = Email;
      this.Phone = Phone;
      this.Address = Address;
      this.Region = Region;
      this.Password = Password;
      this.Verified = Verified;
  }
}
