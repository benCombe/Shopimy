import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}
