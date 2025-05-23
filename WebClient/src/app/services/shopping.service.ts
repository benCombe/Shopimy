import { BehaviorSubject, catchError, combineLatest, map, Observable, of } from 'rxjs';
import { UserService } from './user.service';
/* This service will handle purchasing tasks */

export class Order{
  orderId: number | null = null;
  storeId: number;
  purchaserId: number | -1;
  purchaserEmail: string;
  deliveryAddress: string;
  StripeToken = '123456';
  orderDate: Date;
  status: string;
  items: OrderItem[] = [];
  constructor(
    storeId: number,
    purchaserId: number | -1,
    purchaserEmail: string,
    deliveryAddress: string,
    StripeToken: string,
    status: string,
    items: OrderItem[] = [],
  ){
    this.storeId = storeId;
    this.purchaserId = purchaserId;
    this.purchaserEmail = purchaserEmail;
    this.deliveryAddress = deliveryAddress;
    this.items = items;
    this.StripeToken = StripeToken;
    this.status = status; // Default status
    this.orderDate = new Date(); // Set the order date to the current date
  }
}

export interface OrderItem{
  orderId: number | null;
  itemId: number;
  quantity: number;
}


import { Injectable } from '@angular/core';
import { BasicItem } from '../models/basic-item';
import { User } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { StoreNavService } from './store-nav.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})

export class ShoppingService {

  private apiUrl = `${environment.apiUrl}/api/shoppingcart`;
  storeToDB = false;
  currentStore = '';
  currentStoreId = 0;
  currentUserEmail = '';

  // Updated CartSubject type to store item and quantity
  CartSubject: BehaviorSubject<{ item: BasicItem, quantity: number }[]> = new BehaviorSubject<{ item: BasicItem, quantity: number }[]>([]);
  Cart$ = this.CartSubject.asObservable();

  SubTotalSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  SubTotal$ = this.SubTotalSubject.asObservable();

  // Track if a discount has been applied and the amount
  private discountRate = 0;

  constructor(
    private storeService: StoreService,
    private userService: UserService,
    private http: HttpClient,
    private storeNavService: StoreNavService
  ) {
    combineLatest([
      this.storeNavService.currentUrl$.pipe(map(url => url.split('/')[0])), // Extract store name
      this.userService.activeUser$
    ]).subscribe(([storeUrl, user]) => {
      if (storeUrl && storeUrl !== this.currentStore) {
        console.log(`STORE CHANGE DETECTED: ${this.currentStore} → ${storeUrl}`);
        this.currentStore = storeUrl; // Update the store name

        if (user.Id !== 0) {
          this.fetchUserCart(user); // Load user cart for new store
          this.storeToDB = true;

        } else {
          this.loadGuestCart(); // Load guest cart for new store
        }
      }
    });
    storeService.activeStore$.subscribe(store => {
      this.currentStoreId = store.id;
    });
  }

  private fetchUserCart(user: User): void {
    if (!this.currentStore) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<{ item: BasicItem, quantity: number }[]>(`${this.apiUrl}/active-cart`, { headers }).subscribe({
      next: (cartItems) => {
        this.CartSubject.next(cartItems);
        this.updateTotal();
      },
      error: (err) => console.error('Error fetching user cart:', err)
    });
  }

  private updateTotal(): void {
    const cart = this.CartSubject.getValue();
    let total = 0;

    cart.forEach(item => {
      // Use sale price if available and lower than the regular price
      const price = Math.min(item.item.price, item.item.salePrice);
      total += price * item.quantity;
    });

    // Apply discount if one exists
    if (this.discountRate > 0) {
      total = total * (1 - this.discountRate);
    }

    this.SubTotalSubject.next(Math.round(total * 100) / 100);
  }

  addToCart(item: BasicItem): void {
    const cart = this.CartSubject.getValue();
    const existingItemIndex = cart.findIndex(cartItem => cartItem.item.listId === item.listId);

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += 1; // Increase quantity if item already exists
    } else {
      cart.push({ item, quantity: 1 }); // Add new item with quantity 1
    }

    this.CartSubject.next([...cart]);
    this.updateTotal();

    if (this.storeToDB) {
      this.syncCartToDB(item, 'add');
    } else {
      this.saveGuestCart();
    }
  }

  removeFromCart(item: BasicItem): void {
    const cart = this.CartSubject.getValue();
    const existingItemIndex = cart.findIndex(cartItem => cartItem.item.listId === item.listId);

    if (existingItemIndex !== -1) {
      if (cart[existingItemIndex].quantity > 1) {
        cart[existingItemIndex].quantity = 0;
      }
    }

    cart.splice(existingItemIndex, 1);
    this.CartSubject.next([...cart]);
    this.updateTotal();

    if (this.storeToDB) {
      this.syncCartToDB(item, 'remove');
    } else {
      this.saveGuestCart();
    }
  }

  getQuantity(item: BasicItem): number {
    const cartItem = this.CartSubject.getValue().find(ci => ci.item.listId === item.listId);
    return cartItem ? cartItem.quantity : 0;
  }


  updateItemQuantity(item: BasicItem, change: number): void {
    const updatedCart = this.CartSubject.getValue().map(cartItem => {
      if (cartItem.item.listId === item.listId) {
        return { ...cartItem, quantity: cartItem.quantity + change };
      }
      return cartItem;
    }).filter(cartItem => cartItem.quantity > 0); // Remove if quantity hits 0

    this.CartSubject.next(updatedCart);
    this.updateTotal();

    if (this.storeToDB) {
      this.syncCartToDB(item, change > 0 ? 'add' : 'remove');
    } else {
      this.saveGuestCart();
    }
  }

  // Syncs cart with database
  private syncCartToDB(item: BasicItem, action: 'add' | 'remove'): void {
    const token = localStorage.getItem('auth_token');
    if (!token || !this.currentStore) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = action === 'add' ? `${this.apiUrl}/add` : `${this.apiUrl}/remove/${item.listId}`;
    const method = action === 'add' ? this.http.post(url, { item, quantity: 1 }, { headers }) : this.http.delete(url, { headers });

    method.subscribe({
      next: () => console.log(`Item ${action}ed in database`),
      error: (err) => console.error(`Error ${action}ing item in database:`, err)
    });
  }

  private saveGuestCart(): void {
    if (!this.currentStore) return;
    localStorage.setItem('guest_cart', JSON.stringify(this.CartSubject.getValue()));
  }

  private loadGuestCart(): void {
    if (!this.currentStore) return;
    const savedCart = localStorage.getItem('guest_cart');
    if (savedCart) {
      this.CartSubject.next(JSON.parse(savedCart));
      this.updateTotal();
    }
  }

  public placeOrder(email: string, deliveryAddress: string): Observable<number> {
    const order: Order = this.createOrder(email, deliveryAddress);
    return this.http.post<{ orderId: number }>(`${this.apiUrl}/place_order`, order).pipe(
      map(response => {
        console.log("Order Placed, Order ID:", response.orderId);
        localStorage.setItem('last_order_id', response.orderId.toString()); // Save order ID for later use
        return response.orderId; // Return the order ID
      }),
      catchError(err => {
        console.error(`Error: Order Could Not Be Placed`, err);
        return of(-1); // Return -1 in case of an error
      })
    );
  }


  createOrder(email: string, deliveryAddress: string): Order {
    let userID: number = this.userService.getActiveUser().Id;
    if (userID === 0) {
      userID = -1;
    }
    const result: Order = new Order(
      this.currentStoreId,
      userID,
      email,
      deliveryAddress,
      "123456", //TODO change to actual token later
      "Pending",
      this.CartSubject.getValue().map(cartItem => ({
        orderId: null,
        itemId: cartItem.item.listId,
        quantity: cartItem.quantity
      }))
    );
    return result;
  }

  clearCart(): void {
    this.CartSubject.next([]);
    this.SubTotalSubject.next(0);
    localStorage.removeItem('guest_cart'); // Clear guest cart from local storage
    if (this.storeToDB) {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.delete(`${this.apiUrl}/clear`, { headers }).subscribe({
        next: () => console.log("Cart cleared in database"),
        error: (err) => console.error("Error clearing cart in database:", err)
      });
    }
  }

  // Apply a discount rate to the cart
  applyDiscount(rate: number): void {
    if (rate >= 0 && rate <= 1) {
      this.discountRate = rate;
      this.updateTotal(); // Recalculate total with the new discount
    }
  }

  // Get the current discount rate
  getDiscountRate(): number {
    return this.discountRate;
  }
}

