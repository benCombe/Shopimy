export class RegistrationDetails {
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Address: string;
  Region: string;
  Password: string;

  constructor(
      FirstName: string, LastName: string, Email: string,
      Phone: string, Address: string, Region: string, Password: string
  ) {
      this.FirstName = FirstName;
      this.LastName = LastName;
      this.Email = Email;
      this.Phone = Phone;
      this.Address = Address;
      this.Region = Region;
      this.Password = Password;
  }
}
