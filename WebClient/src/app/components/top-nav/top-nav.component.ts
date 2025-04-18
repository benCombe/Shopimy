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
    { label: 'Items', link: '/items' },
    { label: 'Categories', link: '/categories' },
    {label: 'Cart', link: '/cart'},
    {label: 'Checkout', link: '/checkout'},
    {label: 'Store', link: '/store'}
  ];

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
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.userService.logout();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isMobileMenuOpen = false; // Close mobile menu when resizing to desktop
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
}
