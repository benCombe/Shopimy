import { Component, HostListener, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

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
export class TopNavComponent implements OnInit {
  @Input() hideAccountDropdown: boolean = false;

  isDropdownOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  isMobile: boolean = false;
  isLoggedIn: boolean = false;
  isUserMenuOpen: boolean = false;

  // Organized navigation by categories
  navCategories: NavCategory[] = [
    {
      name: 'Resources',
      options: [
        { label: 'Blog', link: '/blog', icon: 'fa-blog' },
        { label: 'Documentation', link: '/docs', icon: 'fa-book' },
        { label: 'Support', link: '/support', icon: 'fa-headset' },
        { label: 'Contact', link: '/contact', icon: 'fa-envelope' }
      ]
    },
    {
      name: 'Quick Actions',
      options: [
        { label: 'Home', link: '/', icon: 'fa-home' },
        { label: 'About', link: '/about', icon: 'fa-info-circle' },
        { label: 'Dashboard', link: '/dashboard', icon: 'fa-gauge' },
        { label: 'Create Store', link: '/create-store', icon: 'fa-store' }
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
