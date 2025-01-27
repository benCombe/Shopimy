import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [TopNavComponent, NgIf, NgFor, FormsModule, NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {


  imgURL: string = "resources/images/workfromhome.jpg"

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
