import { Category } from "./category";

export class StoreDetails {
  Id: string;
  URL: string;
  Name: string;
  Theme_1: string;
  Theme_2: string;
  Theme_3: string;
  FontFamily: string;
  FontColor: string;
  BannerText: string;
  LogoText: string;
  Categories: Category[];
  LogoUrl?: string;
  Banner: undefined;

  constructor(
    Id: string,
    URL: string,
    Name: string,
    Theme_1: string,
    Theme_2: string,
    Theme_3: string,
    FontFamily: string,
    FontColor: string,
    BannerText: string,
    LogoText: string,
    Categories: Category[]
  ){
    this.Id = Id;
    this.URL = URL;
    this.Name = Name;
    this.Theme_1 = Theme_1;
    this.Theme_2 = Theme_2;
    this.Theme_3 = Theme_3;
    this.FontFamily = FontFamily;
    this.FontColor = FontColor;
    this.BannerText = BannerText;
    this.LogoText = LogoText;
    this.Categories = Categories;
  }

}
