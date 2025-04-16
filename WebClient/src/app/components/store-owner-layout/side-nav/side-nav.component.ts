import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
  @Output() pageChange = new EventEmitter<string>();

  activeNav: string = 'Overview';

  navItems = [
    {name: 'Account', subNav: ['Profile', 'Settings'], open: false},
    {name: 'My Store', subNav: ['Products', 'Orders', 'Themes & Logos', 'Store Editor', 'Promotions'], open: false},
    {name: 'Analytics', subNav: ['Traffic', 'Sales'], open: false}
  ]

  constructor(private userService: UserService, private router: Router, private loadingService: LoadingService) {}

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
    this.loadingService.setIsLoading(true);
    this.userService.logout();
    this.router.navigate(['/home']);
    this.loadingService.setIsLoading(false);
  }
}
