import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherExampleComponent } from './weather-example.component';

describe('WeatherExampleComponent', () => {
  let component: WeatherExampleComponent;
  let fixture: ComponentFixture<WeatherExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherExampleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
