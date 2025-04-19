import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { StoreDetails } from '../../models/store-details';
import { ThemesComponent } from '../store-owner-layout/themes/themes.component';
import { ToggleVisibilityComponent } from '../toggle-visibility/toggle-visibility.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-store-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemesComponent, ToggleVisibilityComponent, RouterLink],
  templateUrl: './store-editor.component.html',
  styleUrl: './store-editor.component.css'
})
export class StoreEditorComponent implements OnInit, OnDestroy {
  store: StoreDetails | null = null;
  isCreateMode = false;
  activeSection = 'basic-info';
  private subscription = new Subscription();
  
  constructor(
    private storeService: StoreService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if we're creating a new store or editing an existing one
    // If activeStore$ returns null, we're in create mode
    this.subscription.add(
      this.storeService.activeStore$.subscribe((store: StoreDetails | null) => {
        if (store) {
          this.store = store;
          this.isCreateMode = false;
        } else {
          this.isCreateMode = true;
          this.store = {
            id: 0,
            userId: '',  // Will be set on server
            name: '',
            description: '',
            logoUrl: '',
            bannerUrl: '',
            phoneNumber: '',
            email: '',
            isActive: false,
            storeTheme: {
              id: 0,
              name: 'Earthy Tones',
              mainColor: '#393727',
              secondColor: '#D0933D',
              thirdColor: '#D3CEBB',
              altColor: '#333333',
              mainFontFam: 'sans-serif'
            },
            slug: '',
            address: {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            }
          };
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  saveStore(): void {
    if (!this.store) return;
    
    if (this.isCreateMode) {
      this.storeService.createStore(this.store).subscribe({
        next: (createdStore) => {
          console.log('Store created successfully', createdStore);
          this.router.navigate(['/store-owner']);
        },
        error: (error) => {
          console.error('Error creating store', error);
        }
      });
    } else {
      this.storeService.updateStore(this.store).subscribe({
        next: (updatedStore) => {
          console.log('Store updated successfully', updatedStore);
          this.router.navigate(['/store-owner']);
        },
        error: (error) => {
          console.error('Error updating store', error);
        }
      });
    }
  }

  updateStoreTheme(theme: any): void {
    if (this.store) {
      this.store.storeTheme = theme;
    }
  }

  updateVisibility(isActive: boolean): void {
    if (this.store) {
      this.store.isActive = isActive;
    }
  }
} 