import { Component, HostListener, OnInit, Input, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { UserService } from '../../services/user.service';
import { StoreService } from '../../services/store.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription, filter } from 'rxjs';

// Define interfaces for the navigation categories and options
interface NavOption {
  label: string;
  link: string;
  icon?: string; // Optional icon property
}

interface NavCategory {
  name: string;
  options: NavOption[];
}

@Component({
  selector: 'app-top-nav',
  imports: [CommonModule, RouterLink],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
  standalone: true
})
export class TopNavComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() hideAccountDropdown: boolean = false;

  isDropdownOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  isMobile: boolean = false;
  isLoggedIn: boolean = false;
  isUserMenuOpen: boolean = false;
  hasStore: boolean = false;
  activeLink: string = '';
  inStoreContext: boolean = false;
  
  private routerSubscription: Subscription | undefined;
  private userSubscription: Subscription | undefined;
  private storeSubscription: Subscription | undefined;
  private themeSubscription: Subscription | undefined;

  // Organized navigation by categories
  navCategories: NavCategory[] = [
    {
      name: 'Resources',
      options: [
        { label: 'Documentation', link: '/docs', icon: 'fa-book' },
        { label: 'Support', link: '/support', icon: 'fa-headset' },
        { label: 'Blog', link: '/blog', icon: 'fa-blog' },
        { label: 'Contact', link: '/contact', icon: 'fa-envelope' }
      ]
    },
    {
      name: 'Quick Actions',
      options: [
        { label: 'Home', link: '/', icon: 'fa-home' },
        { label: 'About', link: '/about', icon: 'fa-info-circle' }
      ]
    }
  ];

  // Legacy options array for backward compatibility
  get options(): NavOption[] {
    return this.navCategories[0].options;
  }

  get filteredOptions() {
    return this.isLoggedIn ? this.options.slice(1) : this.options;  // Remove first option if logged in
  }

  constructor(
    private userService: UserService, 
    private storeService: StoreService,
    private themeService: ThemeService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.onLoad();
    this.activeLink = this.router.url;
    
    this.userSubscription = this.userService.loggedIn$.subscribe(
      loggedIn => {
        this.isLoggedIn = loggedIn;
        if (!loggedIn) {
          this.isUserMenuOpen = false;
          this.hasStore = false;
        } else {
          this.checkUserStore();
        }
      }
    );
    
    this.routerSubscription = this.router.events
      .pipe(filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeLink = event.urlAfterRedirects;
        this.closeMobileMenu();
        this.isUserMenuOpen = false;
        // Log page view for analytics purposes
        this.logNavigation(event.urlAfterRedirects);
      });
      
    // Subscribe to theme service to know when we're in store context
    this.themeSubscription = this.themeService.inStoreContext$.subscribe(
      inStore => {
        this.inStoreContext = inStore;
      }
    );
  }
  
  ngAfterViewInit(): void {
    // Set up keyboard navigation for the menu
    this.setupKeyboardNavigation();
  }
  
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleEscapeKey);
  }
  
  private setupKeyboardNavigation(): void {
    // Add event listener for escape key to close menus
    document.addEventListener('keydown', this.handleEscapeKey);
  }
  
  private handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.closeMobileMenu();
      this.isUserMenuOpen = false;
    }
  };
  
  private logNavigation(url: string): void {
    // Simple logging, in a real app this would connect to an analytics service
    console.log(`Navigation to: ${url}`);
  }
  
  private checkUserStore(): void {
    this.storeSubscription = this.storeService.getCurrentUserStore().subscribe(
      store => {
        this.hasStore = !!store && !!store.id;
      },
      error => {
        console.error('Error checking user store:', error);
        this.hasStore = false;
      }
    );
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.isUserMenuOpen = false;
      this.closeMobileMenu();
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      this.isDropdownOpen = false;
      this.closeMobileMenu();
      
      // Focus trap for accessibility
      setTimeout(() => {
        const firstOption = this.elementRef.nativeElement.querySelector('.dropdown-options.show .opt');
        if (firstOption) {
          firstOption.focus();
        }
      }, 100);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    if (this.isMobileMenuOpen) {
      this.isDropdownOpen = false;
      this.isUserMenuOpen = false;
      document.body.style.overflow = 'hidden';
      
      // Focus trap for mobile menu
      setTimeout(() => {
        const closeButton = this.elementRef.nativeElement.querySelector('.mobile-close-btn');
        if (closeButton) {
          closeButton.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
      
      // Return focus to hamburger
      setTimeout(() => {
        const hamburger = this.elementRef.nativeElement.querySelector('#hamburger');
        if (hamburger) {
          hamburger.focus();
        }
      }, 100);
    }
  }

  logout() {
    this.userService.logout();
    this.isUserMenuOpen = false;
    this.closeMobileMenu();
    this.hasStore = false;
    this.router.navigate(['/']);
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile = window.innerWidth <= 715;
    if (!this.isMobile && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('window:load', [])
  onLoad() {
    this.isMobile = window.innerWidth <= 715;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedElement = event.target as HTMLElement;

    if (!clickedElement.closest('.dropdown-header') && !clickedElement.closest('.dropdown-options') && 
        !clickedElement.closest('#hamburger') && !clickedElement.closest('#mobile-menu')) {
      this.isDropdownOpen = false;
      this.isUserMenuOpen = false;
    }
  }

  navigateAndCloseMenu(link: string) {
    this.closeMobileMenu();
    this.isDropdownOpen = false;
    this.isUserMenuOpen = false;
    
    // Log the menu item click for analytics
    this.logMenuItemClick(link);
  }
  
  private logMenuItemClick(link: string): void {
    console.log(`Menu item clicked: ${link}`);
  }
  
  isActive(link: string): boolean {
    return this.activeLink === link;
  }
}
