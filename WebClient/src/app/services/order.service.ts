import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  // Mock data for development until backend is available
  private mockOrders: Order[] = [
    {
      orderId: 1001,
      orderDate: new Date('2023-11-15T09:30:00'),
      customerName: 'John Smith',
      totalAmount: 129.99,
      status: 'Delivered',
      items: [
        { itemId: 1, name: 'Premium T-Shirt', quantity: 2, price: 29.99, imageUrl: 'assets/mock/tshirt.jpg' },
        { itemId: 3, name: 'Running Shoes', quantity: 1, price: 70.00, imageUrl: 'assets/mock/shoes.jpg' }
      ],
      shippingAddress: '123 Main St, Anytown, CA 91234',
      paymentMethod: 'Credit Card'
    },
    {
      orderId: 1002,
      orderDate: new Date('2023-11-20T14:45:00'),
      customerName: 'Emily Johnson',
      totalAmount: 85.50,
      status: 'Shipped',
      items: [
        { itemId: 5, name: 'Wireless Earbuds', quantity: 1, price: 85.50, imageUrl: 'assets/mock/earbuds.jpg' }
      ],
      shippingAddress: '456 Oak Ave, Springfield, IL 62701',
      paymentMethod: 'PayPal'
    },
    {
      orderId: 1003,
      orderDate: new Date('2023-11-25T11:15:00'),
      customerName: 'Michael Brown',
      totalAmount: 210.75,
      status: 'Processing',
      items: [
        { itemId: 7, name: 'Smart Watch', quantity: 1, price: 199.99, imageUrl: 'assets/mock/watch.jpg' },
        { itemId: 8, name: 'Watch Band', quantity: 1, price: 10.76, imageUrl: 'assets/mock/band.jpg' }
      ],
      shippingAddress: '789 Pine Blvd, Portland, OR 97201',
      paymentMethod: 'Credit Card'
    },
    {
      orderId: 1004,
      orderDate: new Date('2023-11-28T16:20:00'),
      customerName: 'Sophia Garcia',
      totalAmount: 45.00,
      status: 'Pending',
      items: [
        { itemId: 10, name: 'Desk Lamp', quantity: 1, price: 45.00, imageUrl: 'assets/mock/lamp.jpg' }
      ],
      shippingAddress: '101 Maple Dr, Boston, MA 02108',
      paymentMethod: 'Debit Card'
    },
    {
      orderId: 1005,
      orderDate: new Date('2023-11-30T10:05:00'),
      customerName: 'David Wilson',
      totalAmount: 320.25,
      status: 'Cancelled',
      items: [
        { itemId: 12, name: 'Gaming Console', quantity: 1, price: 299.99, imageUrl: 'assets/mock/console.jpg' },
        { itemId: 15, name: 'Controller', quantity: 1, price: 20.26, imageUrl: 'assets/mock/controller.jpg' }
      ],
      shippingAddress: '222 River St, Chicago, IL 60601',
      paymentMethod: 'Credit Card'
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Gets all orders for the current store owner
   * Note: Currently returns mock data until backend is available
   */
  getOrders(): Observable<Order[]> {
    // Return mock data for now
    return of(this.mockOrders);
    
    // Uncomment when backend is ready
    // return this.http.get<Order[]>(this.apiUrl);
  }

  /**
   * Gets a specific order by ID
   * Note: Currently returns mock data until backend is available
   */
  getOrderById(id: number): Observable<Order | undefined> {
    // Return mock data for now
    const order = this.mockOrders.find(o => o.orderId === id);
    return of(order);
    
    // Uncomment when backend is ready
    // return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Updates the status of an order
   * Note: Currently not functional until backend is available
   */
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    // Uncomment when backend is ready
    // return this.http.patch(`${this.apiUrl}/${orderId}`, { status });
    
    // Mock implementation for development
    return of({ success: true, message: 'Status updated successfully' });
  }
} 