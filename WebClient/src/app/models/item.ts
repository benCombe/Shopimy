export class Item {
  Name: string;
  Id: string;
  OriginalPrice: number;
  SalePrice?: number;
  OnSale: boolean;
  Description: string;
  QuantityInStock: number;
  AvailFrom: Date;
  AvailTo: Date;
  CurrentRating: number;
  CategoryIds: number[];
  ImageUrl?: string;  // Added property

  constructor(data: {
    Name: string;
    Id: string;
    OriginalPrice: number;
    SalePrice?: number;
    OnSale: boolean;
    Description: string;
    QuantityInStock: number;
    AvailFrom: Date | string;
    AvailTo: Date | string;
    CurrentRating: number;
    CategoryIds: number[];
    ImageUrl?: string; // Optional
  }) {
    this.Name = data.Name;
    this.Id = data.Id;
    this.OriginalPrice = data.OriginalPrice;
    this.SalePrice = data.SalePrice;
    this.OnSale = data.OnSale;
    this.Description = data.Description;
    this.QuantityInStock = data.QuantityInStock;
    this.AvailFrom = new Date(data.AvailFrom);
    this.AvailTo = new Date(data.AvailTo);
    this.CurrentRating = data.CurrentRating;
    this.CategoryIds = data.CategoryIds;
    this.ImageUrl = data.ImageUrl;
  }
}