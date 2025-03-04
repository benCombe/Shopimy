import { Category } from '../../../models/category';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { StoreDetails } from '../../../models/store-details';
import { ThemeService } from '../../../services/theme.service';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { StoreService } from '../../../services/store.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-store-nav',
  imports: [NgFor, NgIf, NgStyle],
  templateUrl: './store-nav.component.html',
  styleUrl: './store-nav.component.css'
})

export class StoreNavComponent implements AfterViewInit, OnInit{


  storeDetails: StoreDetails = new StoreDetails(0, "default", "DEFAULT", "#000000", "#565656", "#121212", "Cambria, Cochin", "#f6f6f6", "BLANK", "BLANK", []); //Use  Store/Theme services here
  categories: Category[] = [] //["Clothing", "Materials", "Other"].reverse();

  hoverStates: { [key: number]: boolean } = {};

  setHover(categoryId: number, isHovered: boolean): void {
    this.hoverStates = { ...this.hoverStates, [categoryId]: isHovered };
  }

  constructor(
    private renderer: Renderer2,
    private themeService: ThemeService,
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


  ngOnInit(): void {
    this.storeService.activeStore$.subscribe(s =>{
      this.storeDetails = s;
      this.categories = this.mapCategories(s.categories);
      console.log(s.fontColor);
    })
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.themeService.setThemeOne("theme1");
      this.themeService.setThemeTwo("theme2");
      this.themeService.setThemeThree("theme3");
      this.themeService.setFontColor("fc");
      this.themeService.setButtonHoverColor("cat");
    });
  }


  mapCategories(cats: Category[]): Category[]{
    let categoryMap = new Map<number, Category>();
    let rootCategories: Category[] = [];

    // Step 1: Create a map of categories
    cats.forEach(c => {
      categoryMap.set(c.categoryId, { ...c, subCategories: [] });
    });

    // Step 2: Assign subcategories to their parents
    categoryMap.forEach(c => {
      if (c.parentCategory !== null) {
        let parent = categoryMap.get(c.parentCategory);
        if (parent) {
          parent.subCategories.push(c);
        }
      } else {
        rootCategories.push(c); // Top-level categories
      }
    });

    console.log(rootCategories);
    return rootCategories.reverse(); // Reverse for proper order if needed
  }

  addToUrl(categoryName: string): void {
    const currentUrl = this.router.url;
    const newUrl = `${currentUrl}/${categoryName}`;

    this.router.navigateByUrl(newUrl);
  }


  invertColor(origColor: string): string{
      // Ensure the input is a valid hex color
    if (!/^#([0-9A-Fa-f]{6})$/.test(origColor)) {
      throw new Error("Invalid hex color format. Use '#RRGGBB'.");
    }

    // Remove the "#" and convert to an array of two-character hex values
    const inverted = origColor.substring(1)
      .match(/.{2}/g) // Split into ["F0", "F0", "F0"]
      ?.map(hex => (255 - parseInt(hex, 16)).toString(16).padStart(2, '0')) // Invert each channel
      .join(""); // Recombine to form the final color

    return `#${inverted}`;
  }
}
