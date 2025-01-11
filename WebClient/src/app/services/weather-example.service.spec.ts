import { TestBed } from '@angular/core/testing';

import { WeatherExampleService } from './weather-example.service';

describe('WeatherExampleService', () => {
  let service: WeatherExampleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherExampleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
