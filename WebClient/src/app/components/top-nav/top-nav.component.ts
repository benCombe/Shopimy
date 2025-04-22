import { Component, HostListener, OnInit } from '@angular/core';
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
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      this.isDropdownOpen = false;
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

    if (!clickedElement.closest('.dropdown-header') && !clickedElement.closest('.dropdown-options')) {
      const resourcesDropdown = document.querySelector('#nav-wrapper .dropdown:not(#user-menu)');
      if (resourcesDropdown && !resourcesDropdown.contains(clickedElement)){
        this.isDropdownOpen = false;
      }
      const userMenuDropdown = document.querySelector('#user-menu');
      if (userMenuDropdown && !userMenuDropdown.contains(clickedElement)){
        this.isUserMenuOpen = false;
      }
    }
  }

  navigateAndCloseMenu(link: string) {
    this.closeMobileMenu();
  }
}
