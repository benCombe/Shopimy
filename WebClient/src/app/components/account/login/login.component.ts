import { Component } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [TopNavComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}
