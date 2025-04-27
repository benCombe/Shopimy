import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, HostListener, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { LoadingService } from '../../../services/loading.service';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [NgFor, RouterLink, NgIf],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent implements OnInit, OnDestroy {
  @Output() pageChange = new EventEmitter<string>();

  activeNav = 'Overview';
  isMobile = false;
  isMobileSidebarOpen = false;
  
  // Hamburger position tracking
  hamburgerPosition = { 
    y: 15, 
    right: 15  // Set initial position to top-right corner
  };
  private isDragging = false;
  private dragStartPos = { x: 0, y: 0 };
  private initialPos = { y: 0, right: 0 };

  navItems = [
    {name: 'Account', subNav: ['Profile', 'Settings'], open: false},
    {name: 'My Store', subNav: ['Visit Store', 'Products', 'Categories', 'Orders', 'Themes & Logos', 'Store Editor', 'Promotions'], open: false},
    {name: 'Analytics', subNav: ['Traffic & Sales'], open: false}
  ]

  constructor(private userService: UserService, private router: Router, private loadingService: LoadingService, private storeService: StoreService) {}

  ngOnInit() {
    this.checkScreenSize();
    // Load saved position if available
    const savedPosition = localStorage.getItem('hamburgerPosition');
    if (savedPosition) {
      this.hamburgerPosition = JSON.parse(savedPosition);
    }
  }

  ngOnDestroy() {
    // Remove event listeners when component is destroyed
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
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
    if (!this.isDragging) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
      
      // Prevent scrolling of body when mobile menu is open
      if (this.isMobileSidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
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
    
    // For "Visit Store", navigate to the store URL
    if (item === 'Visit Store') {
      // Get the active store from the service
      const activeStore = this.storeService.activeStoreSubject.getValue();
      if (activeStore && activeStore.url) {
        // Navigate to the store page
        this.router.navigate(['/' + activeStore.url]);
        
        // Prevent further navigation handling for this item
        if (event) {
          event.stopPropagation();
        }
        return;
      }
    }
    
    // Only emit pageChange event on user-triggered interaction
    if (event) {
      this.pageChange.emit(item);
    }
    
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

  // Drag handlers for mouse events
  onDragStart(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.dragStartPos = { x: event.clientX, y: event.clientY };
    this.initialPos = { ...this.hamburgerPosition };
    
    // Add event listeners for drag movement and end
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  onDragMove = (event: MouseEvent) => {
    if (this.isDragging) {
      const deltaY = event.clientY - this.dragStartPos.y;
      const deltaX = event.clientX - this.dragStartPos.x;
      
      // Calculate the new position
      let newY = this.initialPos.y + deltaY;
      let newRight = this.initialPos.right - deltaX;  // Inverse relationship for right positioning
      
      // Ensure the button stays within viewport bounds
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Button dimensions (from CSS)
      const buttonSize = 44; // 44px height/width
      
      // Set constraints
      newY = Math.max(5, Math.min(viewportHeight - buttonSize - 5, newY));
      newRight = Math.max(5, Math.min(viewportWidth - buttonSize - 5, newRight));
      
      this.hamburgerPosition = {
        y: newY,
        right: newRight
      };
    }
  }

  onDragEnd = () => {
    if (this.isDragging) {
      this.isDragging = false;
      
      // Save position to localStorage
      localStorage.setItem('hamburgerPosition', JSON.stringify(this.hamburgerPosition));
      
      // Remove event listeners
      document.removeEventListener('mousemove', this.onDragMove);
      document.removeEventListener('mouseup', this.onDragEnd);
    }
  }

  // Touch event handlers for mobile drag
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.dragStartPos = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      };
      this.initialPos = { ...this.hamburgerPosition };
      
      // Add touch event listeners
      document.addEventListener('touchmove', this.onTouchMove, { passive: false });
      document.addEventListener('touchend', this.onTouchEnd);
    }
  }

  onTouchMove = (event: TouchEvent) => {
    if (this.isDragging && event.touches.length === 1) {
      event.preventDefault(); // Prevent scrolling while dragging
      
      const deltaY = event.touches[0].clientY - this.dragStartPos.y;
      const deltaX = event.touches[0].clientX - this.dragStartPos.x;
      
      // Calculate the new position
      let newY = this.initialPos.y + deltaY;
      let newRight = this.initialPos.right - deltaX;  // Inverse relationship for right positioning
      
      // Ensure the button stays within viewport bounds
      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Button dimensions (from CSS)
      const buttonSize = 44; // 44px height/width
      
      // Set constraints
      newY = Math.max(5, Math.min(viewportHeight - buttonSize - 5, newY));
      newRight = Math.max(5, Math.min(viewportWidth - buttonSize - 5, newRight));
      
      this.hamburgerPosition = {
        y: newY,
        right: newRight
      };
    }
  }

  onTouchEnd = () => {
    if (this.isDragging) {
      this.isDragging = false;
      
      // Save position to localStorage
      localStorage.setItem('hamburgerPosition', JSON.stringify(this.hamburgerPosition));
      
      // Remove touch event listeners
      document.removeEventListener('touchmove', this.onTouchMove);
      document.removeEventListener('touchend', this.onTouchEnd);
      
      // Small delay to prevent click from firing after touch end
      setTimeout(() => {
        this.isDragging = false;
      }, 100);
    }
  }
}
