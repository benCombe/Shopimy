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
  options = [
    { label: 'A Resource', link: '/docs' },
    { label: 'Another Resource', link: '/tutorials' },
    { label: 'Resource #3', link: '/support' }
  ];


  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log(this.isDropdownOpen ? "Open" : "Close");
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // Close dropdown if the user clicks outside of it
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (!(event.target as HTMLElement).closest('.dropdown')) {
      this.isDropdownOpen = false;
    }
  }

}
