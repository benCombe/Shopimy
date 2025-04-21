import { LoadingService } from './../../../services/loading.service';
import { Component } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { LoginDetails } from '../../../models/login-details';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TopNavComponent, RouterLink, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = "";
  password: string = "";
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  loginFalied: boolean = false;

  constructor(
    private userService: UserService, 
    private router: Router, 
    private loadingService: LoadingService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.isLoading = true;
    this.loginFalied = false;
    
    const creds = new LoginDetails(this.email, this.password);
    this.userService.login(creds).subscribe({
      next: () => {
        console.log("Login successful, navigating to dashboard overview...");
        this.router.navigate(['/dashboard'], { queryParams: { page: 'Overview' } });
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Login failed: ", err);
        this.loginFalied = true;
        this.isLoading = false;
      },
    });
  }

  loginWithGoogle(): void {
    // Implement Google OAuth login
    console.log('Google login not implemented yet');
  }

  loginWithFacebook(): void {
    // Implement Facebook OAuth login
    console.log('Facebook login not implemented yet');
  }
}
