export class Category {

  categoryId: number;
  storeId: number;
  name: string;
  parentCategory: number | null;

  subCategories: Category[];

  constructor(
    categoryId: number,
    storeId: number,
    name: string,
    parentCategory: number | null
  ){
    this.categoryId = categoryId;
    this.storeId = storeId;
    this.name = name;
    this.parentCategory = parentCategory;
    this.subCategories = [];
  }

}
