// File: src/app/components/category-form/category-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';

import { Category } from '../../models/category';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html'
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;
  categoryId!: number;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      parentCategory: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.categoryId = +params['id'];
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: number) {
    this.categoryService.getCategoryById(id).subscribe(category => {
      this.categoryForm.patchValue({
        name: category.name,
        parentCategory: category.parentCategory
      });
    });
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }

    const formData = this.categoryForm.value;
    if (this.isEditMode) {
      this.categoryService.updateCategory(this.categoryId, formData).subscribe(() => {
        this.router.navigate(['/categories']);
      });
    } else {
      this.categoryService.createCategory(formData).subscribe(() => {
        this.router.navigate(['/categories']);
      });
    }
  }
}
