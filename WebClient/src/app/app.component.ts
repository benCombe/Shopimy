import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherExampleComponent } from './components/weather-example/weather-example.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WeatherExampleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WebClient';
  router: RouterOutlet | undefined;
}
