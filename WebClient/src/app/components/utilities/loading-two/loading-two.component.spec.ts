import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingTwoComponent } from './loading-two.component';

describe('LoadingTwoComponent', () => {
  let component: LoadingTwoComponent;
  let fixture: ComponentFixture<LoadingTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingTwoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
