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
  styles: [`
    .container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .btn-primary {
      background-color: #4a6cf7;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary:hover {
      background-color: #3a50d9;
    }
    .categories-table {
      width: 100%;
      border-collapse: collapse;
    }
    .categories-table th, .categories-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .categories-table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
    .categories-table tr:hover {
      background-color: #f9f9f9;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .btn-edit, .btn-delete {
      padding: 5px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-edit {
      background-color: #4caf50;
      color: white;
    }
    .btn-delete {
      background-color: #f44336;
      color: white;
    }
    .empty-state {
      text-align: center;
      padding: 30px;
      color: #666;
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
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading: boolean = false;
  error: string | null = null;
  isDashboard: boolean = false;

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
    const parent = this.categories.find(c => c.CategoryId === parentId);
    return parent ? parent.Name : 'Unknown';
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
