import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'app-user-page',
  imports: [TopNavComponent, NgIf, NgFor, FormsModule, NgClass,MatSidenavModule, MatButtonModule],
  templateUrl: './user-page.component.html',
  styleUrl: './user-page.component.css'
})


export class UserPageComponent {

  showFiller = false;

  password: string = "";
  confirmPassword: string = ""

  hasValidLength: boolean = false;
  hasUpperLower: boolean = false;
  hasNumberSpecial: boolean = false;
  pwMatch: boolean = false;

  countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ];

  selectedCountry: string | undefined;

  constructor(private cd: ChangeDetectorRef){}


  
  ngOnInit() {
    this.selectedCountry = this.countries[0].value;
    this.cd.detectChanges(); // ✅ Force Angular to detect changes on load
    this.checkStength();
  }

  checkStength():void {
    const lengthCriteria = this.password.length >= 8 && this.password.length <= 20;
    const caseCriteria = /[a-z]/.test(this.password) && /[A-Z]/.test(this.password);
    const numberSpecialCriteria = /\d/.test(this.password) && /[\W_]/.test(this.password); // Special characters

    this.hasValidLength = lengthCriteria;
    this.hasUpperLower = caseCriteria && numberSpecialCriteria;

    this.checkMatch();

    console.log("")
  }

  checkMatch() {
    this.pwMatch = this.password.length > 0 && this.confirmPassword.length > 0 && this.password === this.confirmPassword;
  }

  
}
