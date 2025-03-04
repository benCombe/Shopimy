export class Category {

  CategoryId: number;
  StoreId: number;
  Name: string;
  ParentCategory: number | null;

  constructor(
    CategoryId: number,
    StoreId: number,
    Name: string,
    ParentCategory: number | null
  ){
    this.CategoryId = CategoryId;
    this.StoreId = StoreId;
    this.Name = Name;
    this.ParentCategory = ParentCategory;
  }

}
