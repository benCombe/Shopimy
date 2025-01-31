import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { RegistrationDetails } from '../models/registration-details';
import { Observable, tap } from 'rxjs';
import { LoginDetails } from '../models/login-details';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/account`;

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
}


