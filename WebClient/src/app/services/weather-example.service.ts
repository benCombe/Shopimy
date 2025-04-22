import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

//model must match what is received from server, can use external model if method implementation needed
export interface WeatherForecast{
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}


@Injectable({
  providedIn: 'root'
})

export class WeatherExampleService {
  private apiUrl = `${environment.apiUrl}/api/weatherforecast`;

  private weatherSubject = new BehaviorSubject<WeatherForecast[]>([]);
  public weather$: Observable<WeatherForecast[]> = this.weatherSubject.asObservable(); //this is what components subscribe to

  constructor(private http: HttpClient) {
    console.log(this.apiUrl);
  }

  //makes call to API, returns an Observable of type WeatherForecast[]
  GetWeatherForecast(): Observable<WeatherForecast[]>{
    return this.http.get<WeatherForecast[]>(this.apiUrl).pipe(
      tap((data: WeatherForecast[]) => this.weatherSubject.next(data)) // Update BehaviorSubject with new data, this will also ubdate the weather$ observable
    );
  }

}
