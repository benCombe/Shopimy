import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { StoreService } from '../../services/store.service';
import { ItemService } from '../../services/item.service';
import { StoreDetails } from '../../models/store-details';


@Component({
  imports: [
    ReactiveFormsModule
  ],
  selector: 'app-item-form',
  templateUrl: './item-form.component.html'
})
export class ItemFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  activeStore!: StoreDetails;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private storeService: StoreService,
    private itemService: ItemService
  ) {
    this.productForm = this.fb.group({
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
    this.storeService.activeStore$.subscribe(store => {
      this.activeStore = store;
      
      // Load categories using the store ID
      if (store && store.id) {
        this.categoryService.getCategories(store.id).subscribe(cats => {
          this.categories = cats;
        });
      }
    });
  }


  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }
    // Get the item data from the form.
    const itemData = this.productForm.value;
    // Append the active store ID (assumes StoreDetails has an 'id' property) to associate the item with the store.
    itemData.storeId = this.activeStore.id;
    // Create the item using the dedicated ItemService.
    this.itemService.createProduct(itemData).subscribe({
      next: () => {
        // Success: redirect or show a success message.
        console.log('Item created successfully!');
      },
      error: (err: any) => {
        console.error('Error creating item:', err);
      }
    });
  }
}
