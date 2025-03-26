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
  imports: [TopNavComponent, RouterLink, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  email: string = "";
  password: string = "";

  loginFalied: boolean = false;

  constructor(private userService: UserService, private router: Router, private loadingService: LoadingService){}


  login(): void{
    this.loadingService.setIsLoading(true);
    const creds = new LoginDetails(this.email, this.password);
    this.userService.login(creds).subscribe({
      next: () => {
        console.log("Login successful, navigating to dashboard...");
        this.router.navigate(['/dashboard']); // Redirect to dashboard
        this.loadingService.setIsLoading(false);
      },
      error: (err) => {
        console.error("Login failed: ", err);
        this.loginFalied = true;
        this.loadingService.setIsLoading(false);
      },
    });
  }


}
