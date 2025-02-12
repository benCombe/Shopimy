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

  private apiUrl = `${environment.apiUrl}/account`;


  private activeUserSubject = new BehaviorSubject<User>(new User(0, "Guest", "User", "example@gmail.com", "555-555-5555", "123 Nowhere Lane, Someplace, NS", "Canada", null, true));
  public activeUser$ : Observable<User> = this.activeUserSubject.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService) { }


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
        if (response && response.Token) {
          console.log("Successful Login! ", response.Token); //TODO REMOVE THIS IN PROD
          this.cookieService.set('auth_token', response.Token, 3, '/'); // 3 days expiry
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

  // Logout User
  logout(): void {
    this.cookieService.delete('auth_token', '/');
  }

  // Check if User is Logged In
  isLoggedIn(): boolean {
    return this.cookieService.check('auth_token');
  }


  getActiveUser(): User{
    return this.activeUserSubject.getValue();
  }
}


