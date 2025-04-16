import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WishList {
  id: number;
  name: string;
  userId: number;
  itemCount: number;
  dateCreated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private apiUrl = `${environment.apiUrl}/wishlists`;

  constructor(private http: HttpClient) { }

  getWishLists(userId: number): Observable<WishList[]> {
    return this.http.get<WishList[]>(`${this.apiUrl}/user/${userId}`);
  }

  createWishList(wishList: { name: string, userId: number }): Observable<WishList> {
    return this.http.post<WishList>(`${this.apiUrl}`, wishList);
  }

  deleteWishList(wishListId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${wishListId}`);
  }

  getWishListItems(wishListId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${wishListId}/items`);
  }

  addItemToWishList(wishListId: number, itemId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${wishListId}/items`, { itemId });
  }

  removeItemFromWishList(wishListId: number, itemId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${wishListId}/items/${itemId}`);
  }
} 