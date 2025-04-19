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
import { StoreEditorComponent } from '../store-editor/store-editor.component';
import { CategoryListComponent } from '../../category-list/category-list.component';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../../../services/store.service';
import { LoadingService } from '../../../services/loading.service';
import { StoreDetails } from '../../../models/store-details';

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
    PromotionsComponent,
    AnalyticsComponent,
    StoreEditorComponent,
    CategoryListComponent
  ],
  templateUrl: './store-owner-dashboard.component.html',
  styleUrl: './store-owner-dashboard.component.css'
})

export class StoreOwnerDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('main', { static: false }) mainContent!: ElementRef;
  @ViewChild(SideNavComponent) sideNav!: SideNavComponent;

  user: User | null | undefined;
  currentPage: string = "Overview"; // default page
  showScrollButton: boolean = false;
  scrollThreshold: number = 300; // Show button after scrolling this many pixels
  hasStore: boolean = false;
  showCreateStorePrompt: boolean = false;

  constructor(
    private userService: UserService,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadingService.setIsLoading(true);
    
    // Subscribe to user
    this.userService.activeUser$.subscribe(u => {
      this.user = u;
    });
    
    // Check if the user has a store
    this.storeService.activeStore$.subscribe((store: StoreDetails) => {
      this.hasStore = !!store.id;
      
      // If user has no store, show create store prompt
      if (!this.hasStore) {
        this.showCreateStorePrompt = true;
        this.currentPage = "Store Editor";
      }
      
      this.loadingService.setIsLoading(false);
      
      // Check for page in query params
      this.route.queryParams.subscribe(params => {
        if (params['page']) {
          this.currentPage = params['page'];
          // Update side nav selection if it's already initialized
          if (this.sideNav) {
            this.sideNav.setActive(params['page']);
          }
        }
      });
    });
  }
  
  ngAfterViewInit() {
    // Add scroll event listener to the main content
    if (this.mainContent && this.mainContent.nativeElement) {
      this.mainContent.nativeElement.addEventListener('scroll', () => {
        this.checkScroll();
      });
      
      // Initial check
      this.checkScroll();
    }
  }

  checkScroll() {
    if (this.mainContent && this.mainContent.nativeElement) {
      const scrollPosition = this.mainContent.nativeElement.scrollTop;
      this.showScrollButton = scrollPosition > this.scrollThreshold;
    }
  }

  scrollToTop() {
    if (this.mainContent && this.mainContent.nativeElement) {
      this.mainContent.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  onPageChange(newPage: string) {
    this.currentPage = newPage;
    
    // Reset scroll position when changing pages
    if (this.mainContent && this.mainContent.nativeElement) {
      this.mainContent.nativeElement.scrollTop = 0;
    }
    
    console.log("Navigating To: ", newPage);
  }
}
