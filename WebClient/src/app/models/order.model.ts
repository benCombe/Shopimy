export interface Order {
  orderId: number;
  orderDate: Date;
  customerName: string;
  totalAmount: number;
  status: string; // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  items?: OrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface OrderItem {
  itemId: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
} 