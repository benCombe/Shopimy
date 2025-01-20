import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreOwnerDashboardComponent } from './store-owner-dashboard.component';

describe('StoreOwnerDashboardComponent', () => {
  let component: StoreOwnerDashboardComponent;
  let fixture: ComponentFixture<StoreOwnerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreOwnerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreOwnerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
