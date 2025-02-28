export class Store {

  Name: string;
  Theme_1: string;
  Theme_2: string;
  Theme_3: string;
  FontFamily: string;
  FontColor: string;

  LogoUrl?: string;
  Banner: undefined;

  constructor(
    Name: string,
    Theme_1: string,
    Theme_2: string,
    Theme_3: string,
    FontFamily: string,
    FontColor: string,
    LogoUrl?: string
  ){

    this.Name = Name;
    this.Theme_1 = Theme_1;
    this.Theme_2 = Theme_2;
    this.Theme_3 = Theme_3;
    this.FontFamily = FontFamily;
    this.FontColor = FontColor;
    this.LogoUrl = LogoUrl;
  }

}
