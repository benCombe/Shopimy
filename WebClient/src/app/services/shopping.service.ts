import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
/* This service will handle purchasing tasks */

import { Injectable } from '@angular/core';
import { BasicItem } from '../models/basic-item';
import { User } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ShoppingService {

  private apiUrl = `${environment.apiUrl}/shoppingcart`;
  storeToDB: boolean = false;

  CartSubject: BehaviorSubject<BasicItem[]> = new BehaviorSubject<BasicItem[]>([]);
  Cart$ = this.CartSubject.asObservable();

  SubTotalSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  SubTotal$ = this.SubTotalSubject.asObservable();

  constructor(private userService: UserService, private http: HttpClient) {
    this.userService.activeUser$.subscribe(user => {
      if (user.Id !== 0) { // Not the default guest user
        this.fetchUserCart(user);
        this.storeToDB = true;
      } else {
        this.loadGuestCart();
      }
    });
  }

  private fetchUserCart(user: User): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<BasicItem[]>(`${this.apiUrl}/active-cart`, { headers }).subscribe({
      next: (cartItems) => {
        this.CartSubject.next(cartItems);
        this.updateTotal();
      },
      error: (err) => console.error('Error fetching user cart:', err)
    });
  }

  private updateTotal(): void {
    const cart = this.CartSubject.getValue();
    const total = parseFloat(cart.reduce((sum, item) => sum + Math.min(item.price, item.salePrice), 0).toFixed(2));
    this.SubTotalSubject.next(total);
  }

  addToCart(item: BasicItem): void {
    const updatedCart = [...this.CartSubject.getValue(), item];
    this.CartSubject.next(updatedCart);
    this.updateTotal();

    if (this.storeToDB) {
      this.syncCartToDB(item, 'add');
    } else {
      this.saveGuestCart();
    }
  }

  removeFromCart(item: BasicItem): void {
    const updatedCart = this.CartSubject.getValue().filter(cartItem => cartItem.listId !== item.listId);
    this.CartSubject.next(updatedCart);
    this.updateTotal();

    if (this.storeToDB) {
      this.syncCartToDB(item, 'remove');
    } else {
      this.saveGuestCart();
    }
  }

  //syncs cart with database
  private syncCartToDB(item: BasicItem, action: 'add' | 'remove'): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = action === 'add' ? `${this.apiUrl}/add` : `${this.apiUrl}/remove/${item.listId}`;
    const method = action === 'add' ? this.http.post(url, item, { headers }) : this.http.delete(url, { headers });

    method.subscribe({
      next: () => console.log(`Item ${action}ed in database`),
      error: (err) => console.error(`Error ${action}ing item in database:`, err)
    });
  }

  //saves items for geust users in local storage
  private saveGuestCart(): void {
    //TODO add expiration date to cart
    localStorage.setItem('guest_cart', JSON.stringify(this.CartSubject.getValue()));
  }

  private loadGuestCart(): void {
    //TODO check expiration date of cart
    const savedCart = localStorage.getItem('guest_cart');
    if (savedCart) {
      this.CartSubject.next(JSON.parse(savedCart));
      this.updateTotal();
    }
  }
}
