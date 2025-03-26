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
    if (!(event.target as HTMLElement).closest('#dropdown')) {
      this.isDropdownOpen = false;
    }
    if (!(event.target as HTMLElement).closest('#hamburger')) {
      this.isMobileMenuOpen = false;
    }
    if (!(event.target as HTMLElement).closest('#user-menu')) {
      this.isUserMenuOpen = false;
    }
  }
}
