import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { StoreService } from '../../services/store.service';
//import { StoreDetails } from '../../models/store-details';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideNavComponent } from './side-nav/side-nav.component';
import { StoreOwnerDashboardComponent } from './store-owner-dashboard/store-owner-dashboard.component';

@Component({
  selector: 'app-store-owner-layout',
  templateUrl: './store-owner-layout.component.html',
  styleUrls: ['./store-owner-layout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SideNavComponent,
    StoreOwnerDashboardComponent
  ]
})
export class StoreOwnerLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  sidebarOpen = false; // For mobile view
  private storeSubscription: Subscription | null = null;

  constructor(
    private themeService: ThemeService,
    private storeService: StoreService
  ) { }

  ngOnInit(): void {
    // Check screen size on initialization
    this.checkScreenSize();
    
    // Listen for window resize events
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });

    // Subscribe to active store changes to update theme
    this.storeSubscription = this.storeService.activeStore$.subscribe(store => {
      if (store && store.id && store.id > 0) {
        // Apply store theme when a valid store is available
        this.themeService.applyStoreTheme(store);
      } else {
        // Apply base theme if no valid store
        this.themeService.applyBaseTheme();
      }
    });

    // Initial theme setup - get current store
    this.storeService.getCurrentUserStore().subscribe();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
    // Remove resize event listener
    window.removeEventListener('resize', this.checkScreenSize);
  }

  /**
   * Toggle sidebar collapse state
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    
    // For mobile view, also update sidebarOpen
    if (window.innerWidth <= 992) {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }

  /**
   * Close sidebar (for mobile view)
   */
  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  /**
   * Check screen size and set sidebar state accordingly
   */
  private checkScreenSize(): void {
    if (window.innerWidth <= 992) {
      // On mobile, start with sidebar closed
      this.sidebarCollapsed = true;
      this.sidebarOpen = false;
    } else {
      // On desktop, start with sidebar open
      this.sidebarCollapsed = false;
    }
  }
} 