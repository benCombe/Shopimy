import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { NgIf, CommonModule } from '@angular/common';
import { WeatherExampleService, WeatherForecast} from '../../services/weather-example.service'; //do not include file extensions (.ts) in import statment paths

@Component({
  selector: 'app-weather',
  imports: [NgIf, CommonModule],
  templateUrl: './weather-example.component.html',
  styleUrls: ['./weather-example.component.css'],
})
export class WeatherExampleComponent implements OnInit {

  //weather$: Observable<WeatherForecast[]> | undefined;

  weatherData: WeatherForecast[] = [];
  loading = true;
  error: string | null = null;



  constructor(private weatherService: WeatherExampleService) {}

  //this method runs on the componentent initialization
  ngOnInit(): void {
    // Subscribe to the weather$ observable to get data
    //the data from observables will automatically update within any component subscribed to it
    this.weatherService.GetWeatherForecast().subscribe({
      next: (data) => {
        if (data && data.length > 0){
          this.weatherData = data; // Update weatherData with fetched data
          console.log("DATA: "+data);
        }
        this.loading = false; // Set loading to false
        console.log("DATA: "+data);
        console.log("loading should be false: " + this.loading)
      },
      error: (err) => {
        console.error('Error fetching weather data:', err);
        this.error = 'Failed to fetch weather data'; // Set error message
        this.loading = false; // Set loading to false
      }
    });
  }



  //method returns a dictionary<string, string> of css styles
  getStyle(tempC: number): Record<string, string> {

    if (tempC <= 0) {
      return { 'background-color': '#00f3ff' };
    } else if (tempC <= 10) {
      return { 'background-color': '#81f2f2' };
    } else if (tempC <= 20) {
      return { 'background-color': '#f3efb8' };
    } else if (tempC <= 30) {
      return { 'background-color': '#efcf62' };
    } else {
      return { 'background-color': '#f53737' };
    }
  }
}
