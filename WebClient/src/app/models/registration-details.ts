export class RegistrationDetails {
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Address: string;
  Country: string;
  DOB: Date | null;
  Password: string;
  Subscribed: boolean;

  constructor(
      FirstName: string, LastName: string, Email: string,
      Phone: string, Address: string, Country: string,
      DOB: Date | null, Password: string, Subscribed: boolean
  ) {
      this.FirstName = FirstName;
      this.LastName = LastName;
      this.Email = Email;
      this.Phone = Phone;
      this.Address = Address;
      this.Country = Country;
      this.DOB = DOB;
      this.Password = Password;
      this.Subscribed = Subscribed;
  }
}
