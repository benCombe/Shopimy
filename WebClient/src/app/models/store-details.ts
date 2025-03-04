import { Category } from "./category";

export class StoreDetails {
  id: number;
  url: string;
  name: string;
  theme_1: string;
  theme_2: string;
  theme_3: string;
  fontColor: string;
  fontFamily: string;
  bannerText: string;
  logoText: string;
  categories: Category[];
  LogoUrl?: string;
  Banner: undefined;

  constructor(
    id: number,
    url: string,
    name: string,
    theme_1: string,
    theme_2: string,
    theme_3: string,
    fontColor: string,
    fontFamily: string,
    bannerText: string,
    logoText: string,
    categories: Category[]
  ){
    this.id = id;
    this.url = url;
    this.name = name;
    this.theme_1 = theme_1;
    this.theme_2 = theme_2;
    this.theme_3 = theme_3;
    this.fontColor = fontColor;
    this.fontFamily = fontFamily;
    this.bannerText = bannerText;
    this.logoText = logoText;
    this.categories = categories;
  }

}
