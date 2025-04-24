import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { StoreOwnerLayoutComponent } from './store-owner-layout.component';

// Mock the store-owner-dashboard component
@Component({
  selector: 'app-store-owner-dashboard',
  template: ''
})
class MockStoreOwnerDashboardComponent {}

describe('StoreOwnerLayoutComponent', () => {
  let component: StoreOwnerLayoutComponent;
  let fixture: ComponentFixture<StoreOwnerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        StoreOwnerLayoutComponent,
        MockStoreOwnerDashboardComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreOwnerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar on toggleSidebar call', () => {
    // Initial state
    expect(component.sidebarCollapsed).toBeFalse();
    
    // Toggle sidebar
    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBeTrue();
    
    // Toggle sidebar again
    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBeFalse();
  });

  it('should close sidebar on closeSidebar call', () => {
    // Set sidebar open first
    component.sidebarOpen = true;
    
    // Close sidebar
    component.closeSidebar();
    expect(component.sidebarOpen).toBeFalse();
  });
}); 