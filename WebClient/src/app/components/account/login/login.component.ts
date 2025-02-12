import { Component } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { LoginDetails } from '../../../models/login-details';

@Component({
  selector: 'app-login',
  imports: [TopNavComponent, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  email: string = "";
  password: string = "";

  constructor(private userService: UserService){}


  login(): void{
    const creds = new LoginDetails(this.email, this.password);
    this.userService.login(creds);
  }


}
