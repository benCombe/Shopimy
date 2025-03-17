export class BasicItem {
  listId: number;
  storeId: number;
  name: string;
  price: number;
  salePrice: number;
  quantity: number;
  availFrom: string; // CHANGE TO DATE
  availTo: string; // CHANGE TO DATE
  blob: string;
  categoryId: number;

  constructor(
    listId: number,
    storeId: number,
    name: string,
    price: number,
    salePrice: number,
    quantity: number,
    availFrom: string,
    availTo: string,
    blob: string,
    categoryId: number
  )
  {
    this.listId = listId;
    this.storeId = storeId;
    this.name = name;
    this.price = price;
    this.salePrice = salePrice;
    this.quantity = quantity;
    this.availFrom = availFrom;
    this.availTo = availTo;
    this.blob = blob;
    this.categoryId = categoryId;
  }
}
