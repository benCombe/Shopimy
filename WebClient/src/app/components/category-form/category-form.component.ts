// File: src/app/components/category-form/category-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  styles: [`
    .container {
      max-width: 700px;
      padding: 20px;
    }
    .header {
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .form-control.is-invalid {
      border-color: #f44336;
    }
    .validation-error {
      color: #f44336;
      font-size: 0.85rem;
      margin-top: 5px;
    }
    .hint {
      color: #757575;
      font-size: 0.85rem;
      margin-top: 5px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }
    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #4a6cf7;
      color: white;
    }
    .btn-primary:hover {
      background-color: #3a50d9;
    }
    .btn-primary:disabled {
      background-color: #b5c8ff;
      cursor: not-allowed;
    }
    .btn-secondary {
      background-color: #f5f5f5;
      color: #333;
    }
    .btn-secondary:hover {
      background-color: #e0e0e0;
    }
    .loading, .error-message {
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .loading {
      background-color: #e9f5ff;
      color: #0077cc;
    }
    .error-message {
      background-color: #ffebee;
      color: #c62828;
    }
  `]
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;
  categoryId: number = 0;
  allCategories: Category[] = [];
  loading = false;
  saving = false;
  error: string | null = null;
  isDashboard = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      parentCategory: [null]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.loadingService.setIsLoading(true);
    
    // Check if we're in dashboard mode
    this.isDashboard = this.router.url.includes('/dashboard');
    
    // Load all categories for parent dropdown
    this.categoryService.getCategories().subscribe({
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
    this.loadingService.setIsLoading(true);
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
      this.loadingService.setIsLoading(false);
      return;
    }

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

  navigateBack() {
    const route = this.isDashboard ? '/dashboard/categories' : '/categories';
    this.router.navigate([route]);
  }
}
