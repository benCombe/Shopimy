import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { SideNavComponent } from "../side-nav/side-nav.component";
import { NgClass, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { OverviewComponent } from "../overview/overview.component";
import { ProfileComponent } from "../profile/profile.component";
import { ProductManagementComponent } from "../product-management/product-management.component";
import { PromotionsComponent } from "../promotions/promotions.component";
import { OrdersComponent } from '../orders/orders.component';
import { SettingsComponent } from '../settings/settings.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { ThemesComponent } from '../themes/themes.component';
import { LogoSelectorComponent } from '../logo-selector/logo-selector.component';
import { StoreEditorComponent } from '../store-editor/store-editor.component';
import { CategoryListComponent } from '../../category-list/category-list.component';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../../../services/store.service';
import { LoadingService } from '../../../services/loading.service';
import { StoreDetails } from '../../../models/store-details';
import { ThemeService } from '../../../services/theme.service';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-store-owner-dashboard',
  standalone: true,
  imports: [
    SideNavComponent,
    OverviewComponent,
    ProfileComponent,
    NgIf,
    SettingsComponent,
    ProductManagementComponent,
    OrdersComponent,
    ThemesComponent,
    LogoSelectorComponent,
    PromotionsComponent,
    AnalyticsComponent,
    StoreEditorComponent,
    CategoryListComponent,
    FooterComponent
  ],
  templateUrl: './store-owner-dashboard.component.html',
  styleUrl: './store-owner-dashboard.component.css'
})

export class StoreOwnerDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('main', { static: false }) mainContent!: ElementRef;
  @ViewChild(SideNavComponent) sideNav!: SideNavComponent;

  user: User | null | undefined;
  currentPage = "Overview"; // default page
  hasStore = false;
  showCreateStorePrompt = false;
  themeLogoTab = 'themes'; // Default selected tab for Themes & Logos

  constructor(
    private userService: UserService,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadingService.setIsLoading(true);
    
    // Subscribe to user with improved handling
    this.userService.activeUser$.subscribe(u => {
      this.user = u;
      
      // If the user is a guest (not logged in), call initializeUserState
      // This helps recover from scenarios where the state wasn't properly loaded
      if (!u || u.Id === 0) {
        // Check if there's a token but the user data wasn't loaded
        if (this.userService.isLoggedIn()) {
          this.reloadUserData();
        }
      }
    });
    
    // Default to "Overview" page
    this.currentPage = "Overview";
    
    // First check for page in query params
    this.route.queryParams.subscribe(params => {
      if (params['page']) {
        this.currentPage = params['page'];
        // Update side nav selection if it's already initialized
        if (this.sideNav) {
          this.sideNav.setActive(params['page']);
        }
      }
    });
    
    // Check if the user has a store
    this.storeService.activeStore$.subscribe((store: StoreDetails) => {
      this.hasStore = !!store.id;
      
      // If user has no store, show create store prompt
      if (!this.hasStore) {
        this.showCreateStorePrompt = true;
        // Apply base theme when no store exists
        this.themeService.applyBaseTheme();
        // Only redirect to Store Editor if no specific page was requested in the URL
        if (this.currentPage === "Overview") {
          this.currentPage = "Store Editor";
          // Update side nav selection if it's already initialized
          if (this.sideNav) {
            this.sideNav.setActive("Store Editor");
          }
        }
      } else {
        // Explicitly set to false if the user *does* have a store
        this.showCreateStorePrompt = false;
        // Apply store theme since we have a valid store
        this.themeService.applyStoreTheme(store);
      }
      
      this.loadingService.setIsLoading(false);
    });
  }
  
  ngAfterViewInit() {
    // No scroll event listener needed anymore
  }

  onPageChange(newPage: string) {
    this.currentPage = newPage;
    // Update side nav selection
    if (this.sideNav) {
      this.sideNav.setActive(newPage);
    }
  }

  // Method to force reload user data
  reloadUserData(): void {
    // Initialize user state to reload user data
    this.userService.initializeUserState();
  }
}
