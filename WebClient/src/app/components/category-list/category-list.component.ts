import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: []
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading: boolean = false;
  error: string | null = null;
  isDashboard: boolean = false;
  viewMode: 'table' | 'grid' = 'table';

  constructor(
    private categoryService: CategoryService, 
    private router: Router,
    private loadingService: LoadingService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Check if we're in dashboard mode based on URL
    this.isDashboard = this.router.url.includes('/dashboard');
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.error = null;
    this.loadingService.setIsLoading(true);
    
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loading = false;
        this.loadingService.setIsLoading(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
        this.loadingService.setIsLoading(false);
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.loadingService.setIsLoading(true);
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          console.error('Error deleting category:', err);
          this.error = 'Failed to delete category. Please try again.';
          this.loadingService.setIsLoading(false);
        }
      });
    }
  }

  getCategoryParentName(parentId: number | undefined): string {
    if (!parentId) return 'None';
    const parent = this.categories.find(c => c.categoryId === parentId);
    return parent ? parent.name : 'Unknown';
  }

  createNewCategory() {
    const route = this.isDashboard ? '/dashboard/categories/new' : '/categories/new';
    this.router.navigate([route]);
  }

  editCategory(categoryId: number) {
    const route = this.isDashboard ? 
      `/dashboard/categories/edit/${categoryId}` : 
      `/categories/${categoryId}/edit`;
    this.router.navigate([route]);
  }
}
