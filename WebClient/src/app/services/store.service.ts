import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Item } from '../models/item'; // Assume you have this model
import { StoreDetails } from '../models/store-details';
import { Category } from '../models/category';
import { environment } from '../../environments/environment';


interface Response{
  details: StoreDetails;
  categories: Category[];
}



@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = `${environment.apiUrl}/store`;

  // Base URL for the items endpoint; update if your API uses a different route.
  private itemBaseUrl = '/api/items';
  // Example base URL for the categories endpoint.
  private categoryBaseUrl = '/api/categories';


  activeStoreSubject: BehaviorSubject<StoreDetails> = new BehaviorSubject<StoreDetails>(new StoreDetails(0, "DEFAULT", "DEFAULT", "#232323", "#545454", "#E1E1E1",  "#f6f6f6", "Cambria, Cochin", "BANNER TEXT", "LOGO TEXT", []));

  activeStore$: Observable<StoreDetails> = this.activeStoreSubject.asObservable();

  constructor(private http: HttpClient) { }

  getStoreDetails(url: string): Observable<StoreDetails>{
    return this.http.get<StoreDetails>(`${this.apiUrl}/${url}`).pipe(
      map((resp) => {
        return new StoreDetails(
          resp.id, // Ensure ID is a string
          resp.url,
          resp.name,
          resp.theme_1,
          resp.theme_2,
          resp.theme_3,
          resp.fontColor,
          resp.fontFamily,
          resp.bannerText,
          resp.logoText,
          resp.categories.map(cat =>
            new Category(cat.categoryId, cat.storeId, cat.name, cat.parentCategory)
          )
        );

      }),
      tap((storeDetails) => {
        this.activeStoreSubject.next(storeDetails);
        console.log("Mapped StoreDetails:", storeDetails);
        console.log(storeDetails);
      }),
      catchError((error) => {
        console.error('Error fetching store details:', error);
        return throwError(() => new Error('Failed to fetch store details.'));
      })
    );
  }


  // Creates a new item
  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.itemBaseUrl, item);
  }

  // Retrieves all items
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.itemBaseUrl);
  }

  // Example method for fetching categories for a store
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.categoryBaseUrl);
  }
  getItemById(id: string): Observable<Item> {
    // Mock implementation, replace with actual API call
    const mockItem: Item = {
      Id: id,
      Name: 'Mock Item',
      SalePrice: 100,
      OriginalPrice: 150,
      OnSale: true,
      Description: 'This is a mock item',
      QuantityInStock: 10,
      CategoryIds: [1],
      ImageUrl: 'mock-image-url', //images will be bytes
      AvailFrom: new Date(),
      AvailTo: new Date(),
      CurrentRating: 5
    };
    return of(mockItem);
  }
  updateStock(itemId: string, newStock: number): Observable<Item> {
    return this.http.put<Item>(`${this.itemBaseUrl}/${itemId}/stock`, { quantityInStock: newStock });
  }
}
