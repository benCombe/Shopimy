import { Component, HostListener, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-top-nav',
  imports: [NgIf, NgFor, NgClass, RouterLink],
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

  options = [
    { label: 'Register', link: '/register' },
    { label: 'Dashboard', link: '/dashboard' },
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
      }
    );
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log(this.isDropdownOpen ? "Open" : "Close");
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log("Mobile menu toggled:", this.isMobileMenuOpen ? "Open" : "Closed");

    // If opening mobile menu, close other menus
    if (this.isMobileMenuOpen) {
      this.isDropdownOpen = false;
      this.isUserMenuOpen = false;

      // Prevent scrolling when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when mobile menu is closed
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;

      // Restore scrolling when mobile menu is closed
      document.body.style.overflow = '';
      console.log("Mobile menu closed");
    }
  }

  logout() {
    this.userService.logout();
    this.closeMobileMenu(); // Close mobile menu if open
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false; // Close mobile menu when resizing to desktop
      document.body.style.overflow = ''; // Restore scrolling
    }
  }

  @HostListener('window:load', [])
  onLoad() {
    this.isMobile = window.innerWidth <= 768;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // Close dropdown if the user clicks outside of it
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const clickedElement = event.target as HTMLElement;

    // Close Resources dropdown
    if (!clickedElement.closest('#dropdown')) {
      this.isDropdownOpen = false;
    }

    // Close User menu dropdown
    if (!clickedElement.closest('#user-menu')) {
      this.isUserMenuOpen = false;
    }

    // We don't need to handle mobile menu here since we have a dedicated overlay for it
  }

  navigateAndCloseMenu(link: string) {
    console.log("Navigating to:", link);
    this.closeMobileMenu();
    // The routerLink directive will handle the actual navigation
  }
}
