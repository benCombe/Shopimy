import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { StoreService } from '../../services/store.service';
import { ItemService } from '../../services/item.service';
import { StoreDetails } from '../../models/store-details';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html'
})
export class ItemFormComponent implements OnInit {
  itemForm: FormGroup;
  categories: Category[] = [];
  activeStore!: StoreDetails;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private storeService: StoreService,
    private itemService: ItemService
  ) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      originalPrice: [0, Validators.required],
      salePrice: [null],
      description: [''],
      quantityInStock: [0, Validators.required],
      availFrom: [new Date(), Validators.required],
      availTo: [new Date(), Validators.required],
      categoryIds: [[], Validators.required]  // Multi-select for category IDs
    });
  }

  ngOnInit(): void {
    // Load available categories for selection.
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
    // Subscribe to the active store observable so we know which store is currently active.
    this.storeService.activeStore$.subscribe(store => {
      this.activeStore = store;
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      return;
    }
    // Get the item data from the form.
    const itemData = this.itemForm.value;
    // Append the active store ID (assumes StoreDetails has an 'id' property) to associate the item with the store.
    itemData.storeId = this.activeStore.id;
    // Create the item using the dedicated ItemService.
    this.itemService.createItem(itemData).subscribe({
      next: () => {
        // Success: redirect or show a success message.
        console.log('Item created successfully!');
      },
      error: (err) => {
        console.error('Error creating item:', err);
      }
    });
  }
}
