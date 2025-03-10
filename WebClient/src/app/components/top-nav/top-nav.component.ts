import { Component, HostListener } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  imports: [NgIf, NgFor, NgClass, RouterLink],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css'
})
export class TopNavComponent {

  isDropdownOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  isMobile: boolean = false;

  options = [
    { label: 'Register', link: '/register' },
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Items', link: '/items' },
    { label: 'Categories', link: '/categories' },
    {label: 'Cart', link: '/cart'},
    {label: 'Checkout', link: '/checkout'},
    {label: 'Store', link: '/store'}
  ];

  ngOnInit(): void {
     this.onLoad();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log(this.isDropdownOpen ? "Open" : "Close");
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
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
  }

}
