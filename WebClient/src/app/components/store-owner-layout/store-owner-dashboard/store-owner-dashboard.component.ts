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

  user: User | null | undefined;
  currentPage: string = "Overview"; // default page
  showScrollButton: boolean = false;
  scrollThreshold: number = 300; // Show button after scrolling this many pixels

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.activeUser$.subscribe(u => {
      this.user = u;
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
