import { Component } from '@angular/core';
import { PopupComponent } from './components/utilities/popup/popup.component'; // Import PopupComponent
import { WeatherExampleComponent } from './components/weather-example/weather-example.component';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,  // ✅ Standalone component
  imports: [PopupComponent, LandingPageComponent, RouterOutlet, RouterLink], // ✅ Import child components
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showPopup = false;
  question = 'Do you want to continue?';
  responses = ['Yes', 'No', 'Maybe'];

  handleResponse(response: string) {
    console.log('User selected:', response);
    this.showPopup = false; // Hide popup after selection
  }

  openPopup() {
    this.showPopup = true;
  }
}
