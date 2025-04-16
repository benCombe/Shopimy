import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [NgFor, RouterLink, NgIf],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit {
  @Output() pageChange = new EventEmitter<string>();

  activeNav: string = 'Overview';
  isMobile: boolean = false;
  isMobileSidebarOpen: boolean = false;

  navItems = [
    {name: 'Account', subNav: ['Profile', 'Settings'], open: false},
    {name: 'My Store', subNav: ['Products', 'Orders', 'Themes & Logos', 'Store Editor', 'Promotions'], open: false},
    {name: 'Analytics', subNav: ['Traffic', 'Sales'], open: false}
  ]

  constructor(private userService: UserService, private router: Router, private loadingService: LoadingService) {}

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    
    // If we transition from mobile to desktop, close the mobile sidebar
    if (!this.isMobile) {
      this.isMobileSidebarOpen = false;
    }
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    
    // Prevent scrolling of body when mobile menu is open
    if (this.isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleDropdown(item: any) {
    // Close any other open dropdown first
    if (item.open === false) {
      this.navItems.forEach(navItem => {
        if (navItem !== item) {
          navItem.open = false;
        }
      });
    }
    
    // Toggle the dropdown menu
    item.open = !item.open;
  }

  setActive(item: string, event?: Event) {
    this.activeNav = item;
    this.pageChange.emit(item);
    
    // Close mobile sidebar when a navigation item is selected
    if (this.isMobile) {
      this.isMobileSidebarOpen = false;
      document.body.style.overflow = '';
    }
    
    // Prevent click event from bubbling up to parent div
    if (event) {
      event.stopPropagation();
    }
  }

  logout(): void {
    this.loadingService.setIsLoading(true);
    this.userService.logout();
    this.router.navigate(['/home']);
    this.loadingService.setIsLoading(false);
  }
}
