import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-side-nav',
  imports: [NgIf, NgFor, NgClass, RouterLink],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
  @Output() pageChange = new EventEmitter<string>();

  activeNav: string = 'Overview';

  navItems = [
    {name: 'Account', subNav: ['Profile', 'Settings'], open: false},
    {name: 'My Store', subNav: ['Products', 'Orders', 'Themes & Logos', 'Promotions'], open: false},
    {name: 'Analytics', subNav: ['Traffic', 'Sales'], open: false}
  ]

  constructor(private userService: UserService, private router: Router) {}

  toggleDropdown(item: any) {
    // Toggle the dropdown menu
    item.open = !item.open;
  }

  setActive(item: string, event?: Event) {
    this.activeNav = item;
    this.pageChange.emit(item)
    // Prevent click event from bubbling up to parent div
    if (event) {
      event.stopPropagation();
    }
  }

  logout(): void{
    this.userService.logout();
    this.router.navigate(['/home']);
  }
}
