import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemReviewsComponent } from './item-reviews.component';

describe('ItemReviewsComponent', () => {
  let component: ItemReviewsComponent;
  let fixture: ComponentFixture<ItemReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemReviewsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
