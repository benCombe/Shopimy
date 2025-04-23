import { Component, HostListener, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

// Define an interface for the navigation options
interface NavOption {
  label: string;
  link: string;
  icon?: string; // Optional icon property
}

@Component({
  selector: 'app-top-nav',
  imports: [CommonModule, RouterLink],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
  standalone: true
})
export class TopNavComponent implements OnInit {
  @Input() hideAccountDropdown: boolean = false;

  isDropdownOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  isMobile: boolean = false;
  isLoggedIn: boolean = false;
  isUserMenuOpen: boolean = false;

  // Update options to use the NavOption interface and include icons
  options: NavOption[] = [
    // Example Resources (adjust as needed)
    { label: 'Blog', link: '/blog', icon: 'fa-newspaper' },
    { label: 'Documentation', link: '/docs', icon: 'fa-book' },
    { label: 'Support', link: '/support', icon: 'fa-headset' },
    // --- Other Example Links (adjust or remove as needed) ---
    //{ label: 'Register', link: '/register', icon: 'fa-user-plus' },
    //{ label: 'Dashboard', link: '/dashboard', icon: 'fa-tachometer-alt' },
    //{ label: 'Items', link: '/items' }, // Example without icon
    //{ label: 'Categories', link: '/categories' },
    //{ label: 'Cart', link: '/cart', icon: 'fa-shopping-cart' },
    //{ label: 'Checkout', link: '/checkout', icon: 'fa-credit-card' },
    //{ label: 'Store', link: '/store' }
  ];

  get filteredOptions() {
    return this.isLoggedIn ? this.options.slice(1) : this.options;  // Remove first option if logged in
  }

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.onLoad();
    this.userService.loggedIn$.subscribe(
      loggedIn => {
        this.isLoggedIn = loggedIn;
        if (!loggedIn) {
          this.isUserMenuOpen = false;
        }
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
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    if (this.isMobileMenuOpen) {
      this.isDropdownOpen = false;
      this.isUserMenuOpen = false;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    }
  }

  logout() {
    this.userService.logout();
    this.isUserMenuOpen = false;
    this.closeMobileMenu();
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
  }
}
