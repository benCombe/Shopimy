import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { StoreDetails } from '../../models/store-details';
import { ThemesComponent } from '../store-owner-layout/themes/themes.component';
import { Subscription } from 'rxjs';
import { ComponentVisibility, DEFAULT_VISIBILITY } from '../../models/component-visibility.model';
import { StoreTheme } from '../../models/store-theme.model';

@Component({
  selector: 'app-store-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemesComponent, RouterLink],
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
          this.store = new StoreDetails(
            0,
            '',
            '',
            '#393727',
            '#D0933D',
            '#D3CEBB',
            '#333333',
            'sans-serif',
            'Welcome to our store',
            '',
            '',
            '',
            [],
            DEFAULT_VISIBILITY
          );
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

  updateStoreTheme(theme: StoreTheme): void {
    if (this.store) {
      this.store.theme_1 = theme.mainColor;
      this.store.theme_2 = theme.secondColor;
      this.store.theme_3 = theme.thirdColor;
      this.store.fontColor = theme.altColor;
      this.store.fontFamily = theme.mainFontFam;
    }
  }
} 