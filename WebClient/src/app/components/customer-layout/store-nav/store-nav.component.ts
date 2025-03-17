import { CategoryPageComponent } from './../category-page/category-page.component';
import { Category } from '../../../models/category';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, Renderer2 } from '@angular/core';
import { StoreDetails } from '../../../models/store-details';
import { ThemeService } from '../../../services/theme.service';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { StoreService } from '../../../services/store.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreNavService } from '../../../services/store-nav.service';

@Component({
  selector: 'app-store-nav',
  imports: [NgFor, NgIf, NgStyle, RouterLink],
  templateUrl: './store-nav.component.html',
  styleUrl: './store-nav.component.css'
})

export class StoreNavComponent implements AfterViewInit, OnInit{

  @Output() ViewChanged = new EventEmitter<string>();

  storeDetails: StoreDetails | null = null; //new StoreDetails(0, "DEFAULT", "DEFAULT", "#232323", "#545454", "#E1E1E1",  "#f6f6f6", "Cambria, Cochin", "BANNER TEXT", "LOGO TEXT", []); //Use  Store/Theme services here
  categories: Category[] = [] //["Clothing", "Materials", "Other"].reverse();

  hoverStates: { [key: number]: boolean } = {};

  storeUrl = "";

  setHover(categoryId: number, isHovered: boolean): void {
    this.hoverStates = { ...this.hoverStates, [categoryId]: isHovered };
  }

  constructor(
    private renderer: Renderer2,
    private themeService: ThemeService,
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private storeNavService: StoreNavService
  ) {}


  ngOnInit(): void {
    this.storeService.activeStore$.subscribe(s =>{
      this.storeDetails = s;
      this.categories = this.mapCategories(s.categories);
      console.log("Store Details:", this.storeDetails);
    });
    this.route.params.subscribe(params => {
      this.storeUrl = params['storeUrl'];
      //this.storeService.getStoreDetails(storeUrl);
    });
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

    return rootCategories.reverse(); // Reverse for proper order if needed
  }

  /* addToUrl(categoryName: string): void {
    const currentUrl = this.router.url;
    const newUrl = `${currentUrl}/${categoryName}`;

    this.router.navigateByUrl(newUrl);
  } */

  /* addToUrl(categoryName: string): void {
    const currentSegments = this.router.url.split('/').filter(segment => segment); // Remove empty segments
    const newSegments = [...currentSegments, categoryName]; // Append category

    this.router.navigate(newSegments); // Navigate to new path
  } */

  addToUrl(segment: string): void {
      /* this.router.navigate([segment], { relativeTo: this.route });
      this.ViewChanged.emit(segment);
      console.log(segment); */
      this.storeNavService.changeView(segment);
  }

  storeHome(): void{
    this.storeNavService.toStoreHome();
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
