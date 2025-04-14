import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { CookieService } from './cookie.service';
import { RegistrationDetails } from '../models/registration-details';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { LoginDetails } from '../models/login-details';
import { Item } from '../models/item';
import { BasicItem } from '../models/basic-item';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  // Base URL for the items endpoint. Adjust if your API path is different.
  private itemBaseUrl = `${environment.apiUrl}/item`;


  private defaultItem: Item = new Item({
    Name: '',
    Id: '',
    OriginalPrice: 0,
    SalePrice: 0,
    OnSale: false,
    Description: '',
    QuantityInStock: 0,
    AvailFrom: new Date(),
    AvailTo: new Date(),
    CurrentRating: 0,
    CategoryIds: [],
    ImageUrl: ''
  });
  private activeItemSubject = new BehaviorSubject<Item>(this.defaultItem);
  public activeItem$ : Observable<Item> = this.activeItemSubject.asObservable();


  constructor(private http: HttpClient) {}

  // Creates a new item
  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.itemBaseUrl, item);
  }

  // Retrieves all items
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.itemBaseUrl);
  }

  // Retrieves a single item by its ID.
  // Replace the mock implementation with a real API call when available.
  getItemById(id: number): Observable<BasicItem> {
    const url = `${this.itemBaseUrl}/BasicItem/${id}`;  // Correct endpoint for fetching a single item
    console.log('Fetching item from:', url);
    return this.http.get<BasicItem>(url).pipe(
      tap(response => {
        console.log('Response from API:', response);  // Log the response for debugging
      })
    );
  }


  // Updates the stock level for a given item.
  updateStock(itemId: number, newStock: number): Observable<Item> {
    return this.http.put<Item>(`${this.itemBaseUrl}/${itemId}/stock`, { quantityInStock: newStock });
  }
}
