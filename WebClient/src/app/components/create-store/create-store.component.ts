import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreDetails } from '../../models/store-details';
import { DEFAULT_VISIBILITY } from '../../models/component-visibility.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-store',
  templateUrl: './create-store.component.html',
  styleUrls: ['./create-store.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateStoreComponent implements OnInit {
  storeForm: FormGroup;
  loading = false;
  error = '';
  returnUrl: string = '/';
  quickCreateMode = false;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.storeForm = this.fb.group({
      storeName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      storeUrl: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9-]+$'), Validators.minLength(3), Validators.maxLength(30)]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Check if user already has a store
    this.storeService.hasStore().subscribe(hasStore => {
      if (hasStore) {
        // User already has a store, redirect to store dashboard
        this.router.navigate(['/store-dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (this.storeForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const newStore = new StoreDetails(
      0, // ID will be assigned by server
      this.storeForm.value.storeUrl,
      this.storeForm.value.storeName,
      '#232323', // theme_1
      '#545454', // theme_2
      '#E1E1E1', // theme_3
      '#f6f6f6', // fontColor
      'Cambria, Cochin', // fontFamily
      'Welcome to My Store', // bannerText
      this.storeForm.value.storeName, // logoText
      '', // bannerURL
      '', // logoURL
      [], // categories
      DEFAULT_VISIBILITY // componentVisibility
    );

    this.storeService.createStore(newStore).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Failed to create store';
      }
    });
  }

  quickCreate(): void {
    this.loading = true;
    this.error = '';
    
    this.storeService.createDefaultStore().subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Failed to create default store';
      }
    });
  }
} 