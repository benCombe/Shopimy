// File: src/app/components/category-form/category-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent implements OnInit, OnChanges {
  @Input() categoryToEdit: Category | null = null;
  @Input() allCategories: Category[] = [];
  @Input() isModal = false;
  @Output() formSubmitted = new EventEmitter<{name: string; parentCategory?: number | null}>();
  @Output() canceled = new EventEmitter<void>();

  categoryForm: FormGroup;
  isEditMode = false;
  categoryId = 0;
  loading = false;
  saving = false;
  error: string | null = null;
  isDashboard = false;
  private currentStoreId = 0;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private storeService: StoreService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      parentCategory: [null]
    });
  }

  ngOnInit(): void {
    // Check if we're in dashboard mode
    this.isDashboard = this.router.url.includes('/dashboard');
    
    // Subscribe to the active store to get the current store ID
    this.storeService.activeStore$.subscribe(store => {
      this.currentStoreId = store.id;
    });
    
    if (this.isModal) {
      // Modal mode - data is passed via @Input
      this.initializeFormFromInputs();
    } else {
      // Route mode - load data from API
      this.loading = true;
      this.loadingService.setIsLoading(true);
      
      // Load all categories for parent dropdown
      this.categoryService.getCategories(this.currentStoreId).subscribe({
        next: (categories: Category[]) => {
          this.allCategories = categories;
          this.loadCategory();
        },
        error: (err: any) => {
          console.error('Error loading categories:', err);
          this.error = 'Failed to load categories. Please try again.';
          this.loading = false;
          this.loadingService.setIsLoading(false);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryToEdit'] && this.isModal) {
      this.initializeFormFromInputs();
      this.setupNameValidator();
    }
    if (changes['allCategories'] && this.isModal) {
      this.setupNameValidator();
    }
  }

  initializeFormFromInputs(): void {
    if (this.categoryToEdit) {
      this.isEditMode = true;
      this.categoryId = this.categoryToEdit.categoryId;
      this.categoryForm.patchValue({
        name: this.categoryToEdit.name,
        parentCategory: this.categoryToEdit.parentCategory
      });
    } else {
      this.isEditMode = false;
      this.categoryId = 0;
      this.categoryForm.reset({
        name: '',
        parentCategory: null
      });
    }
    this.setupNameValidator();
    this.loading = false;
  }

  setupNameValidator(): void {
    const control = this.categoryForm.get('name');
    const existingNames = this.allCategories.map(c => c.name.toLowerCase());
    const currentName = this.categoryToEdit?.name.toLowerCase() || null;
    control?.setValidators([
      Validators.required,
      Validators.maxLength(100),
      (c) => {
        const val = c.value?.trim().toLowerCase();
        if (val && existingNames.includes(val) && val !== currentName) {
          return { duplicateName: true };
        }
        return null;
      }
    ] as ValidatorFn[]);
    control?.updateValueAndValidity();
  }

  loadCategory() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.categoryId = +params['id'];
        
        this.categoryService.getCategoryById(this.categoryId).subscribe({
          next: (category: Category | null) => {
            if (category) {
              this.categoryForm.patchValue({
                name: category.name,
                parentCategory: category.parentCategory
              });
            }
            this.loading = false;
            this.loadingService.setIsLoading(false);
          },
          error: (err: any) => {
            console.error('Error loading category:', err);
            this.error = 'Failed to load category. Please try again.';
            this.loading = false;
            this.loadingService.setIsLoading(false);
          }
        });
      } else {
        // Create mode - just stop loading
        this.loading = false;
        this.loadingService.setIsLoading(false);
      }
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.saving = true;
    this.error = null;

    const formData = this.categoryForm.value;
    
    // Convert empty string to null for parent
    if (formData.parentCategory === '') {
      formData.parentCategory = null;
    }
    
    // Don't allow a category to be its own parent
    if (this.isEditMode && formData.parentCategory === this.categoryId) {
      this.error = 'A category cannot be its own parent.';
      this.saving = false;
      return;
    }

    if (this.isModal) {
      // In modal mode, emit the form data to parent component
      this.formSubmitted.emit(formData);
      this.saving = false;
    } else {
      // Direct API call in route mode
      this.loadingService.setIsLoading(true);
      
      if (this.isEditMode) {
        this.categoryService.updateCategory(this.categoryId, formData).subscribe({
          next: () => {
            this.navigateBack();
          },
          error: (err: any) => {
            console.error('Error updating category:', err);
            this.error = 'Failed to update category. Please try again.';
            this.saving = false;
            this.loadingService.setIsLoading(false);
          }
        });
      } else {
        this.categoryService.createCategory(formData).subscribe({
          next: () => {
            this.navigateBack();
          },
          error: (err: any) => {
            console.error('Error creating category:', err);
            this.error = 'Failed to create category. Please try again.';
            this.saving = false;
            this.loadingService.setIsLoading(false);
          }
        });
      }
    }
  }

  navigateBack() {
    if (this.isModal) {
      this.canceled.emit();
    } else {
      const route = this.isDashboard ? '/dashboard/categories' : '/categories';
      this.router.navigate([route]);
    }
  }
}
