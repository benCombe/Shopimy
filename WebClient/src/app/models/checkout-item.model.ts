export interface CheckoutItem {
  id: number;       // Internal ID of the item/variant
  name: string;     // Name to display in Stripe
  price: number;    // Price per unit (ensure this is the price used for calculation)
  quantity: number; // Quantity being purchased
} 