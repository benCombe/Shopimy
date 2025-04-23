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
          // Don't auto-login the user
          /* Original auto-login code, commented out:
          this.login(new LoginDetails(user.Email, user.Password)).subscribe(); //Login user if successful registration
          */
          
          // Instead, just return success
          console.log('Registration successful');
        }
      })
    )
  }


  //Login
  login(credentials: LoginDetails): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token && response.user) {
          console.log("Successful Login! Token received.");
          this.cookieService.set('auth_token', response.token, 3, '/'); // 3 days expiry
          
          const loggedInUser = new User(
            response.user.Id,
            response.user.FirstName,
            response.user.LastName,
            response.user.Email,
            response.user.Phone,
            response.user.Address,
            response.user.Country,
            null,
            response.user.Verified,
            '',
            '',
            '',
            null,
            null,
            null
          );
          
          this.activeUserSubject.next(loggedInUser);
          this.loggedInSubject.next(true);
        } else {
          console.error("Login response missing token or user data.", response);
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
      // Convert empty string to null for DOB
      DOB: user.DOB === "" ? null : user.DOB,
      Subscribed: user.Subscribed
    };

    console.log('Sending profile update payload:', profileUpdate);

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
            DOB: user.DOB === "" ? null : user.DOB,
            Subscribed: user.Subscribed
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
          console.log("User data received from API:", user);
          
          // Ensure email is properly set
          if (!user.Email && (user as any).email) {
            user.Email = (user as any).email;
          }
          
          this.activeUserSubject.next(user);
          this.loggedInSubject.next(true);
          console.log("User session checked and updated:", user);
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


