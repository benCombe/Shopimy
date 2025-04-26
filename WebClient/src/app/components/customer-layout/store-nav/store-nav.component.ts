import { Component, EventEmitter, HostListener, OnInit, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf, NgStyle, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../models/category';
import { StoreDetails } from '../../../models/store-details';
import { ThemeService } from '../../../services/theme.service';
import { StoreService } from '../../../services/store.service';
import { StoreNavService } from '../../../services/store-nav.service';
import { ShoppingService } from '../../../services/shopping.service';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';

interface ResourceOption {
  title: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-store-nav',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle, CommonModule, RouterModule, FormsModule],
  templateUrl: './store-nav.component.html',
  styleUrl: './store-nav.component.css'
})
export class StoreNavComponent implements AfterViewInit, OnInit, OnDestroy {
  @Output() ViewChanged = new EventEmitter<string>();

  storeDetails: StoreDetails | null = null;
  categories: Category[] = [];
  hoveredCategory: Category | null = null;
  storeUrl = "";
  isMobile = false;
  isMobileMenuOpen = false;
  cartItemCount = 0;
  showResourcesDropdown = false;
  searchQuery = '';
  usingCustomTheme = true;
  storeId: number | undefined;
  primaryColor: string | undefined;
  secondaryColor: string | undefined;
  tertiaryColor: string | undefined;
  isLoggedIn: boolean = false;
  userStore: StoreDetails | null = null;
  private authSubscription: Subscription | undefined;
  private userStoreSubscription: Subscription | undefined;

  resourceOptions: ResourceOption[] = [
    { title: 'Home', route: '/home', icon: 'fa-home' },
    { title: 'About', route: '/about', icon: 'fa-info-circle' },
    { title: 'Blog', route: '/blog', icon: 'fa-newspaper' },
    { title: 'Documentation', route: '/docs', icon: 'fa-book' },
    { title: 'Support', route: '/support', icon: 'fa-headset' },
    { title: 'FAQs', route: '/faqs', icon: 'fa-question-circle' }
  ];

  constructor(
    private themeService: ThemeService,
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private storeNavService: StoreNavService,
    private shoppingService: ShoppingService,
    private userService: UserService
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties are initialized
   */
  ngOnInit(): void {
    this.checkScreenSize();
    
    this.authSubscription = this.userService.loggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      console.log('Login status updated in nav:', this.isLoggedIn);
      
      // Fetch user's store when logged in
      if (this.isLoggedIn) {
        this.loadUserStore();
      } else {
        this.userStore = null;
      }
    });

    this.storeService.activeStore$.subscribe(
      store => {
        if (store) {
          this.storeDetails = store;
          this.storeId = store.id;
          this.primaryColor = store.theme_1;
          this.secondaryColor = store.theme_2;
          this.tertiaryColor = store.theme_3;
          this.categories = this.mapCategories(store.categories);
          this.usingCustomTheme = !!store.theme_1;
        }
      },
      error => {
        console.error('Error fetching active store:', error);
      }
    );
    
    this.route.params.subscribe(params => {
      this.storeUrl = params['storeUrl'];
    });

    this.shoppingService.Cart$.subscribe(cart => {
      this.cartItemCount = cart.length;
    });

    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menuContainer = document.querySelector('.mobile-nav');
      const hamburgerButton = document.querySelector('.menu-toggle');
      
      if (menuContainer && hamburgerButton && 
          !menuContainer.contains(target) && 
          !hamburgerButton.contains(target) && 
          this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }

      const resourcesContainer = document.querySelector('.resources-container');
      if (this.showResourcesDropdown && 
          resourcesContainer && 
          !resourcesContainer.contains(target)) {
        this.showResourcesDropdown = false;
      }
    });
  }

  /**
   * Load the user's store if they are logged in
   */
  private loadUserStore(): void {
    this.userStoreSubscription = this.storeService.getCurrentUserStore().subscribe(
      store => {
        // Only set the userStore if it has a valid ID
        if (store && store.id && store.id > 0) {
          this.userStore = store;
          console.log('User store loaded:', this.userStore);
        } else {
          this.userStore = null;
        }
      },
      error => {
        console.error('Error loading user store:', error);
        this.userStore = null;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userStoreSubscription) {
      this.userStoreSubscription.unsubscribe();
    }
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      // Apply store theme if details are available, otherwise use base theme
      if (this.storeDetails) {
        this.themeService.applyStoreTheme(this.storeDetails);
      }
    });
  }

  hoverCategory(category: Category): void {
    this.hoveredCategory = category;
  }

  unhoverCategory(): void {
    this.hoveredCategory = null;
  }

  mapCategories(cats: Category[]): Category[] {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    cats.forEach(category => {
      categoryMap.set(category.categoryId, { 
        ...category, 
        subCategories: [] 
      });
    });

    categoryMap.forEach(category => {
      if (category.parentCategory !== null) {
        const parent = categoryMap.get(category.parentCategory);
        if (parent) {
          parent.subCategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }

  navigateToCategory(category: Category): void {
    this.router.navigate(['/category', category.name]);
    this.closeMobileMenu();
  }

  navigateToSubcategory(category: Category, subcategory: Category): void {
    this.router.navigate(['/category', category.name, subcategory.name]);
    this.closeMobileMenu();
  }

  navigateToHome(): void {
    this.storeNavService.toStoreHome();
    this.closeMobileMenu();
  }

  navigateToCart(): void {
    this.router.navigate(['cart'], { relativeTo: this.route });
    this.closeMobileMenu();
  }

  toggleResourcesDropdown(): void {
    this.showResourcesDropdown = !this.showResourcesDropdown;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  searchProducts(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.closeMobileMenu();
      this.searchQuery = '';
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 900;
    if (!this.isMobile) {
      this.closeMobileMenu();
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/account/login']);
    this.closeMobileMenu();
  }

  logout(): void {
    this.userService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  /**
   * Navigate to the user's store management dashboard
   */
  navigateToMyStore(): void {
    this.router.navigate(['/store']);
    this.closeMobileMenu();
  }

  navigateToProfile(): void {
    this.router.navigate(['/dashboard'], {
      queryParams: { page: 'Profile' }
    });
    this.closeMobileMenu();
  }
}
