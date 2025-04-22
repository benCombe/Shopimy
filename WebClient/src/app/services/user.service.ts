import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { RegistrationDetails } from '../models/registration-details';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginDetails } from '../models/login-details';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/api/account`;

  private defaultUser: User = new User(
    0,
    "Guest",
    "User",
    "example@gmail.com",
    "555-555-5555",
    "123 Nowhere Lane, Someplace, NS",
    "Canada",
    null,
    true,
    "Someplace",
    "NS",
    "A1A 1A1",
    null,
    null,
    null
  );

  private activeUserSubject = new BehaviorSubject<User>(this.defaultUser);
  public activeUser$ : Observable<User> = this.activeUserSubject.asObservable();

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  public loggedIn$ : Observable<boolean> = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService) {

    // Check if user is logged in on service initialization
    this.checkSession();
  }


  //Register
  register(user: RegistrationDetails): Observable<boolean>{
    return this.http.post<boolean>(`${this.apiUrl}/register`, user).pipe(
      tap(success => {
        if (success) {
          this.login(new LoginDetails(user.Email, user.Password)).subscribe(); //Login user if successful registration
        }
      })
    )
  }


  //Login
  login(credentials: LoginDetails): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          console.log("Successful Login! ", response.token); //TODO REMOVE THIS IN PROD
          this.cookieService.set('auth_token', response.token, 3, '/'); // 3 days expiry
          const rUser = new User(
            response.user.id,
            response.user.firstName,
            response.user.lastName,
            response.user.email,
            response.user.phone,
            response.user.address,
            response.user.country,
            null, //No Stored Password
            response.user.verified,
            response.user.city,
            response.user.province,
            response.user.postalCode,
            response.user.countryCode,
            response.user.phoneCode
          );
          this.activeUserSubject.next(rUser);
          this.loggedInSubject.next(true);
        }
      })
    );
  }


   // Get User Profile
  getUserProfile(): Observable<any> {
    const token = this.cookieService.get('auth_token');
    if (!token) return new Observable(observer => observer.error('No token found'));

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/profile`, { headers });
  }

  // Update user profile
  updateUserProfile(user: User): Observable<boolean> {
    const token = this.cookieService.get('auth_token');
    if (!token) return new Observable(observer => observer.error('No token found'));

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Create profile update object - excluding Email and Password
    const profileUpdate = {
      FirstName: user.FirstName,
      LastName: user.LastName,
      Phone: user.Phone,
      Address: user.Address,
      City: user.City,
      State: user.State,
      PostalCode: user.PostalCode,
      Country: user.Country,
      DOB: (user as any).DOB,
      Subscribed: (user as any).Subscribed
    };

    return this.http.put<boolean>(`${this.apiUrl}/profile`, profileUpdate, { headers }).pipe(
      tap(success => {
        if (success) {
          // Update the activeUser$ BehaviorSubject
          const currentUser = this.activeUserSubject.getValue();
          const updatedUser = {
            ...currentUser,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Phone: user.Phone,
            Address: user.Address,
            City: user.City,
            State: user.State,
            PostalCode: user.PostalCode,
            Country: user.Country,
            DOB: (user as any).DOB,
            Subscribed: (user as any).Subscribed
          };
          this.activeUserSubject.next(updatedUser as User);
        }
      })
    );
  }

  // Logout User
  logout(): void {
    const token = this.cookieService.get('auth_token');
    console.log("Token Fetched: " + token);

    if (!token) {
      console.log("No token found, logging out locally...");
      this.clearSession();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // JSON format
    });

    this.http.post<boolean>(`${this.apiUrl}/logout`, { token }, { headers }).subscribe({
      next: () => {
        console.log("Logout successful from API");
        this.clearSession();
      },
      error: err => {
        console.error("Error logging out", err);
        this.clearSession(); // Ensure session is cleared even if API fails
      }
    });
  }

  checkSession(): void {
    const token = this.cookieService.get('auth_token');
   // console.log("Token Fetched: " + token);

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get<User>(`${this.apiUrl}/profile`, { headers }).subscribe({
        next: user => {
          this.activeUserSubject.next(user);
          this.loggedInSubject.next(true);
          console.log("User session checked: ", user);
        },
        error: err => {
          this.activeUserSubject.next(this.defaultUser);
          this.loggedInSubject.next(false);
          this.cookieService.delete('auth_token', '/');
          console.error("Error checking user session", err);
        }
      });
    } else {
      this.activeUserSubject.next(this.defaultUser);
      this.loggedInSubject.next(false);
    }
  }

  private clearSession(): void {
    this.cookieService.delete('auth_token', '/');
    this.activeUserSubject.next(this.defaultUser);
    this.loggedInSubject.next(false);
  }


  // Check if User is Logged In
  isLoggedIn(): boolean {
    return this.cookieService.check('auth_token');
  }


  getActiveUser(): User{
    return this.activeUserSubject.getValue();
  }

  //TODO Implement
  //getUserPurchaseHistory
  //getUserPaymentMethods
  //getUserWishlists
}


