export class ActiveUser {
  Id: number;
  LoginDate: Date;
  Token: string;

  constructor(Id: number, LoginDate: Date, Token: string) {
      this.Id = Id;
      this.LoginDate = LoginDate;
      this.Token = Token;
  }
}
