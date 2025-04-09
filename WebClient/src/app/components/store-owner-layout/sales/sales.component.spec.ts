import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { SalesComponent } from './sales.component';

describe('SalesComponent', () => {
  let component: SalesComponent;
  let fixture: ComponentFixture<SalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesComponent, CommonModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesComponent);
    component = fixture.componentInstance;
    
    // Set mock data before tests run
    component.monthlySalesData = [
      { month: 'Jan', amount: 3200 },
      { month: 'Feb', amount: 4500 },
      { month: 'Mar', amount: 5200 },
      { month: 'Apr', amount: 6800 },
      { month: 'May', amount: 8900 },
      { month: 'Jun', amount: 14000 }
    ];
    
    component.categorySalesData = [
      { category: 'Electronics', percentage: 35, color: '#FF6384' },
      { category: 'Clothing', percentage: 25, color: '#36A2EB' }
    ];
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should calculate bar height correctly', () => {
    const maxValue = 14000; // From the test data
    expect(component.getBarHeight(7000)).toBe(50); // Should be 50% of max
  });
  
  it('should calculate pie slice angles correctly', () => {
    // For first slice (index 0)
    expect(component.getPieSliceStart(0)).toBe('0deg');
    expect(component.getPieSliceEnd(0)).toBe('126deg'); // 35% of 360 degrees
    
    // For second slice (index 1)
    expect(component.getPieSliceStart(1)).toBe('126deg');
    expect(component.getPieSliceEnd(1)).toBe('216deg'); // (35+25)% of 360 degrees
  });
});
