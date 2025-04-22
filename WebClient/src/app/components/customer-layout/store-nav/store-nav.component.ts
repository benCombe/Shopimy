import { Component, EventEmitter, HostListener, OnInit, Output, AfterViewInit } from '@angular/core';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../models/category';
import { StoreDetails } from '../../../models/store-details';
import { ThemeService } from '../../../services/theme.service';
import { StoreService } from '../../../services/store.service';
import { StoreNavService } from '../../../services/store-nav.service';
import { ShoppingService } from '../../../services/shopping.service';

@Component({
  selector: 'app-store-nav',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle],
  templateUrl: './store-nav.component.html',
  styleUrl: './store-nav.component.css'
})
export class StoreNavComponent implements AfterViewInit, OnInit {
  @Output() ViewChanged = new EventEmitter<string>();

  storeDetails: StoreDetails | null = null;
  categories: Category[] = [];
  hoverStates: { [key: number]: boolean } = {};
  storeUrl = "";
  isMobile = false;
  menuOpen = false;
  numCartItems = 0;

  constructor(
    private themeService: ThemeService,
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private storeNavService: StoreNavService,
    private shoppingService: ShoppingService
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties are initialized
   */
  ngOnInit(): void {
    this.checkScreenSize();
    
    this.storeService.activeStore$.subscribe(store => {
      this.storeDetails = store;
      this.categories = this.mapCategories(store.categories);
    });
    
    this.route.params.subscribe(params => {
      this.storeUrl = params['storeUrl'];
    });

    this.shoppingService.Cart$.subscribe(cart => {
      this.numCartItems = cart.length;
    });
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.themeService.setThemeOne("theme1");
      this.themeService.setThemeTwo("theme2");
      this.themeService.setThemeThree("theme3");
      this.themeService.setFontColor("fc");
      this.themeService.setButtonHoverColor("cat");
    });
  }

  /**
   * Set hover state for a category
   * @param categoryId - ID of the category
   * @param isHovered - Whether the category is being hovered over
   */
  setHover(categoryId: number, isHovered: boolean): void {
    this.hoverStates = { ...this.hoverStates, [categoryId]: isHovered };
  }

  /**
   * Maps flat category list to hierarchical structure
   * @param cats - List of categories to map
   * @returns Array of top-level categories with subcategories nested
   */
  mapCategories(cats: Category[]): Category[] {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // Step 1: Create a map of categories
    cats.forEach(category => {
      categoryMap.set(category.categoryId, { ...category, subCategories: [] });
    });

    // Step 2: Assign subcategories to their parents
    categoryMap.forEach(category => {
      if (category.parentCategory !== null) {
        const parent = categoryMap.get(category.parentCategory);
        if (parent) {
          parent.subCategories.push(category);
        }
      } else {
        rootCategories.push(category); // Top-level categories
      }
    });

    return rootCategories.reverse(); // Reverse for proper order if needed
  }

  /**
   * Navigates to a specific category
   * @param segment - URL segment for the category
   */
  navigateToCategory(segment: string): void {
    this.storeNavService.changeView(segment);
  }

  /**
   * Navigates to the store home page
   */
  navigateToHome(): void {
    this.storeNavService.toStoreHome();
  }

  /**
   * Navigates to the shopping cart
   */
  navigateToCart(): void {
    this.router.navigate(['cart'], { relativeTo: this.route });
  }

  /**
   * Inverts a hex color
   * @param origColor - Original hex color (format: #RRGGBB)
   * @returns Inverted hex color
   */
  invertColor(origColor: string): string {
    // Ensure the input is a valid hex color
    if (!/^#([0-9A-Fa-f]{6})$/.test(origColor)) {
      return origColor; // Return original if invalid format
    }

    // Remove the "#" and convert to an array of two-character hex values
    const inverted = origColor.substring(1)
      .match(/.{2}/g) // Split into ["F0", "F0", "F0"]
      ?.map(hex => (255 - parseInt(hex, 16)).toString(16).padStart(2, '0')) // Invert each channel
      .join(""); // Recombine to form the final color

    return `#${inverted}`;
  }

  /**
   * Checks screen size and updates isMobile flag
   */
  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 900;
  }

  /**
   * Toggles the mobile menu open/closed state
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
