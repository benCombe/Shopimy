export class DeliveryDetails {
  id?: number;
  userId: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;

  constructor(
    userId: number,
    address: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    phone: string,
    isDefault: boolean = false,
    id?: number
  ) {
    this.userId = userId;
    this.address = address;
    this.city = city;
    this.state = state;
    this.country = country;
    this.postalCode = postalCode;
    this.phone = phone;
    this.isDefault = isDefault;
    this.id = id;
  }
} 