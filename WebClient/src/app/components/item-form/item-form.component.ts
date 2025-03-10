import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { StoreService } from '../../services/store.service';


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

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private storeService: StoreService
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
    // Load available categories to select from
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      return;
    }

    const itemData = this.productForm.value;
    this.storeService.createItem(itemData).subscribe(() => {
      // Redirect or show success notification
    });
  }
}
