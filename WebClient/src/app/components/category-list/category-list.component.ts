import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { StoreService } from '../../services/store.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, CategoryFormComponent],
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading: boolean = false;
  error: string | null = null;
  isDashboard: boolean = false;
  viewMode: 'table' | 'grid' = 'table';
  
  // Modal state
  isModalOpen: boolean = false;
  selectedCategory: Category | null = null;
  private currentStoreId: number = 0;

  constructor(
    private categoryService: CategoryService, 
    private router: Router,
    private loadingService: LoadingService,
    private userService: UserService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    // Check if we're in dashboard mode based on URL
    this.isDashboard = this.router.url.includes('/dashboard');
    
    // Subscribe to the active store to get the store ID
    this.storeService.activeStore$.subscribe(store => {
      this.currentStoreId = store.id;
    });
    
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.error = null;
    this.loadingService.setIsLoading(true);
    
    this.categoryService.getCategories(this.currentStoreId).subscribe({
      next: (cats: Category[]) => {
        this.categories = cats;
        this.loading = false;
        this.loadingService.setIsLoading(false);
      },
      error: (err: any) => {
        console.error('Error loading categories:', err);
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
        this.loadingService.setIsLoading(false);
      }
    });
  }

  deleteCategory(id: number) {
    // Find the category to show its name in the confirmation message
    const categoryToDelete = this.categories.find(c => c.categoryId === id);
    if (!categoryToDelete) {
      this.error = 'Cannot find the category to delete. Please refresh the page.';
      return;
    }
    
    if (confirm(`Are you sure you want to delete the category "${categoryToDelete.name}"? This action cannot be undone.`)) {
      this.loadingService.setIsLoading(true);
      
      // Pass the current store ID to ensure we're deleting from the correct store
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
          // Clear any previous errors
          this.error = null;
        },
        error: (err) => {
          // For 404 errors, just refresh the list without showing an error
          if (err.status === 404) {
            // Only log to console if we're in development mode
            if (!environment.production) {
              console.warn(`Category ID ${id} not found during deletion - refreshing list`);
            }
            // Silently refresh the category list
            this.error = null;
            this.loadCategories();
          } else {
            // For other errors, show the error message
            console.error('Error deleting category:', err);
            this.error = err.message || 'Failed to delete category. Please try again.';
            this.loadingService.setIsLoading(false);
          }
        }
      });
    }
  }

  getCategoryParentName(parentId: number | null | undefined): string {
    if (!parentId) return 'None';
    const parent = this.categories.find(c => c.categoryId === parentId);
    return parent ? parent.name : 'Unknown';
  }

  // Modal methods
  openCreateModal() {
    this.selectedCategory = null;
    this.isModalOpen = true;
  }

  openEditModal(category: Category) {
    this.selectedCategory = category;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory = null;
  }

  handleFormSubmit(formData: {name: string; parentCategory?: number | null}) {
    this.loadingService.setIsLoading(true);
    
    // Use the store ID from the active store
    const categoryData = {
      ...formData,
      storeId: this.currentStoreId
    };
    
    if (this.selectedCategory) {
      // Update existing category
      this.categoryService.updateCategory(this.selectedCategory.categoryId, categoryData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating category:', err);
          this.error = err.error?.error || 'Failed to update category. Please try again.';
          this.loadingService.setIsLoading(false);
        }
      });
    } else {
      // Create new category
      this.categoryService.createCategory(categoryData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating category:', err);
          this.error = err.error?.error || 'Failed to create category. Please try again.';
          this.loadingService.setIsLoading(false);
        }
      });
    }
  }
}
