import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
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


  activeStoreSubject: BehaviorSubject<StoreDetails> = new BehaviorSubject<StoreDetails>(new StoreDetails("0000","knittingnut", "KnittingNut",  //Default Store (for testing/etc.)
                                                                                        "#0f5e16",
                                                                                        "#88AA99",
                                                                                        "#cafadb",
                                                                                        "Cambria, Cochin",
                                                                                        "#f6f6f6",
                                                                                        "Explore Our Knitting Products!",
                                                                                        "TEXT ABOUT THE STORE AND WHY IT IS AWHSUM",
                                                                                        []));

  activeStore$: Observable<StoreDetails> = this.activeStoreSubject.asObservable();


  activeStoreCategorySubject: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  activeStoreCategory$: Observable<Category[]> = this.activeStoreCategorySubject.asObservable();

  constructor(private http: HttpClient) { }

  getStoreDetails(url: string): Observable<Response>{
    return this.http.get<Response>(`${this.apiUrl}/${url}`).pipe(
      tap((resp) => {
        this.activeStoreSubject.next(resp.details);
        this.activeStoreCategorySubject.next(resp.categories);
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
