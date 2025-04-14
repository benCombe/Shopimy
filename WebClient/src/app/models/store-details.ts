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
  bannerURL: string;
  logoURL: string;
  categories: Category[];
  LogoUrl?: string;
  BannerUrl?: string; // Changed from Banner: undefined to BannerUrl?: string

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
    bannerURL: string,
    logoURL: string,
    categories: Category[]
    categories: Category[],
    logoUrl?: string,
    bannerUrl?: string
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
    this.bannerURL = bannerURL;
    this.logoURL = logoURL;
    this.categories = categories;
    this.LogoUrl = logoUrl;
    this.BannerUrl = bannerUrl;
  }
}
