import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingOneComponent } from './loading-one.component';

describe('LoadingOneComponent', () => {
  let component: LoadingOneComponent;
  let fixture: ComponentFixture<LoadingOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
