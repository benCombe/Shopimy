import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { ThemeService } from '../../../services/theme.service';
import { StoreService } from '../../../services/store.service';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { StoreDetails } from '../../../models/store-details';
import { LoadingService } from '../../../services/loading.service';
import { ShoppingCartComponent } from "../shopping-cart/shopping-cart.component";
import { CheckoutComponent } from "../checkout/checkout.component";
import { StoreNavService } from '../../../services/store-nav.service';
import { CategoryPageComponent } from '../category-page/category-page.component';
import { ItemDetailComponent } from "../../item-detail/item-detail.component";
import { FooterComponent } from "../../footer/footer.component";
import { filter, Subject, takeUntil } from 'rxjs';

// Import the new shared components
import { HeroBannerComponent } from "../../shared/hero-banner/hero-banner.component";
import { StoreHeaderComponent } from "../../shared/store-header/store-header.component";
import { FeaturedProductsComponent } from "../../shared/featured-products/featured-products.component";
import { TestimonialsComponent } from "../../shared/testimonials/testimonials.component";
import { NewsletterComponent } from "../../shared/newsletter/newsletter.component";
import { CategoriesComponent } from "../../shared/categories/categories.component";
import { StoreTheme } from '../../../models/store-theme.model';

// Using a more flexible type that allows category names while maintaining type safety for known values
type ViewType = 'store-page' | 'cart' | 'checkout' | string;

@Component({
  selector: 'app-store-page',
  standalone: true,
  imports: [
    CommonModule, 
    StoreNavComponent, 
    ShoppingCartComponent, 
    CheckoutComponent, 
    CategoryPageComponent, 
    ItemDetailComponent,
    FooterComponent,
    // Add the new shared components
    HeroBannerComponent,
    StoreHeaderComponent,
    FeaturedProductsComponent,
    TestimonialsComponent,
    NewsletterComponent,
    CategoriesComponent
  ],
  templateUrl: './store-page.component.html',
  styleUrls: ['./store-page.component.css']
})

export class StorePageComponent implements AfterViewInit, OnInit, OnDestroy {

  storeData: StoreDetails | null = null;
  currentUrl = "";
  currentView: ViewType = "store-page";
  currentItemView = 0;
  storeTheme: StoreTheme | null = null;

  loadingStore = false;

  isMobile = false;
  initialLoad = true;
  
  private destroy$ = new Subject<void>();

  currentBannerUrl = '';
/*   bannerImages: string[] = [
    'https://picsum.photos/1200/300?random=1',
  'https://picsum.photos/1200/300?random=2',
  'https://picsum.photos/1200/300?random=3'
  ];
  private bannerIndex: number = 0;
  private bannerIntervalId: any; */

  constructor(
    private route:ActivatedRoute,
    private router: Router,
    private themeService: ThemeService,
    private storeService: StoreService,
    private loadingService: LoadingService,
    private storeNavService: StoreNavService
  ){}


  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 900;
  }

  ngOnInit(): void {
    this.loadingStore = true;
    this.checkScreenSize();
    const fullUrl = this.router.url;
    const urlext = fullUrl.split("/");
    console.log(urlext);

    if (urlext.length > 2){
      const view = urlext[2];
      if (view === 'cart' || view === 'checkout' || view ==='item') {
        console.log("Navigating to " + view);
        this.changeView(view); // Update the view based on URL (cart or checkout)
      }
    }

    // Listen for route changes to reset theme when navigating away from store page
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationStart) => {
      // If navigating away from a store page
      if (!event.url.includes(this.currentUrl) && this.storeData) {
        console.log('Navigating away from store, resetting theme');
        this.themeService.applyBaseTheme();
      }
    });

    this.loadingService.setIsLoading(true);
    this.route.paramMap.subscribe(params => {
      const storeUrl = params.get('storeUrl'); // Use 'storeUrl' as defined in routes
      console.log("Fetching for " + storeUrl);
      if (storeUrl) {
        this.storeService.getStoreDetails(storeUrl).subscribe({
          next: (data) => {
            this.storeData = data;
            // DEBUG: What's in storeData?
            console.log('StoreData:', this.storeData);
           /*  if (this.storeData?.bannerURL) {
              this.bannerImages.unshift(this.storeData.bannerURL);
            }
 */
           // this.startBannerRotation();
            this.storeNavService.initialize();

            // Create theme object from store data
            this.updateStoreTheme(data);

            // Apply theme from store data
            console.log("Applying store theme:", data.theme_1, data.theme_2, data.theme_3);
            this.applyStoreTheme(data);

            this.storeNavService.currentUrl$.subscribe(u =>{
              console.log("URL: " + u);
              this.currentUrl = u;
              if (!this.initialLoad)
                this.currentView = this.extractViewFromUrl(u);
              console.log("CURRENT VIEW: " + this.currentView);
            });

            console.log("STORE DATA: " + data);
          },
          error: (err) => console.error('Failed to load store:', err)
        });
      }
    });

    this.loadingStore = false;
    this.initialLoad = false;
    this.loadingService.setIsLoading(false);
  }
/*   startBannerRotation(): void {
    if (this.bannerImages.length === 0) return;

    this.currentBannerUrl = this.bannerImages[0];
    console.log('Initial banner:', this.currentBannerUrl); // ✅

    this.bannerIntervalId = setInterval(() => {
      this.bannerIndex = (this.bannerIndex + 1) % this.bannerImages.length;
      this.currentBannerUrl = this.bannerImages[this.bannerIndex];
      console.log('Rotating banner to:', this.currentBannerUrl); // ✅
    }, 3000);
  }
 */
  ngAfterViewInit(): void {
    // Apply theme on after view init as well to ensure components have loaded
    if (this.storeData) {
      this.updateStoreTheme(this.storeData);
      this.applyStoreTheme(this.storeData);
    }
  }
  
  ngOnDestroy(): void {
    // Reset to base theme when component is destroyed
    this.themeService.applyBaseTheme();
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  // New method to apply the store theme
  applyStoreTheme(storeData: StoreDetails): void {
    // Update theme service with store details
    if (!storeData) return;

    // Apply theme using ThemeService
    this.themeService.applyStoreTheme(storeData);
    
    // Set component-specific variables directly on the root element
    const rootElement = document.documentElement;
    
    // Apply the primary theme variables first - ensuring they're set correctly
    rootElement.style.setProperty('--main-color', storeData.theme_1 || '#393727');
    rootElement.style.setProperty('--second-color', storeData.theme_2 || '#D0933D');
    rootElement.style.setProperty('--third-color', storeData.theme_3 || '#D3CEBB');
    rootElement.style.setProperty('--alt-color', storeData.fontColor || '#FFFFFF');
    rootElement.style.setProperty('--main-font-fam', storeData.fontFamily || 'Inria Serif, serif');
    
    // Then set component-specific variables for banner section
    rootElement.style.setProperty('--banner-section-bg', storeData.theme_2 || '#D0933D');
    rootElement.style.setProperty('--banner-text-bg', storeData.theme_1 || '#393727');
    rootElement.style.setProperty('--banner-text-color', storeData.fontColor || '#FFFFFF');
    
    // Header section variables
    rootElement.style.setProperty('--header-bg-color', storeData.theme_1 || '#393727');
    
    // Featured products section variables
    rootElement.style.setProperty('--featured-bg', storeData.theme_3 || '#D3CEBB');
    rootElement.style.setProperty('--featured-heading-color', storeData.theme_1 || '#393727');
    rootElement.style.setProperty('--action-button-bg', storeData.theme_2 || '#D0933D');
    
    // Categories section variables
    rootElement.style.setProperty('--categories-bg', storeData.theme_3 || '#D3CEBB');
    rootElement.style.setProperty('--categories-heading-color', storeData.theme_1 || '#393727');
    rootElement.style.setProperty('--categories-underline-color', storeData.theme_2 || '#D0933D');
    
    // Newsletter section variables
    rootElement.style.setProperty('--newsletter-bg', storeData.theme_3 || '#D3CEBB');
    rootElement.style.setProperty('--newsletter-heading-color', storeData.theme_1 || '#393727');
    rootElement.style.setProperty('--newsletter-button-bg', storeData.theme_2 || '#D0933D');
    rootElement.style.setProperty('--newsletter-text-color', storeData.theme_1 || '#393727');
    rootElement.style.setProperty('--newsletter-input-bg', storeData.fontColor || '#FFFFFF');
    
    // Testimonials section variables
    rootElement.style.setProperty('--testimonials-bg', storeData.theme_3 || '#D3CEBB');
    rootElement.style.setProperty('--testimonials-heading-color', storeData.theme_1 || '#393727');
    rootElement.style.setProperty('--testimonials-text-color', storeData.theme_1 || '#393727');
    rootElement.style.setProperty('--testimonials-author-color', storeData.theme_2 || '#D0933D');
    rootElement.style.setProperty('--testimonials-card-bg', storeData.fontColor || '#FFFFFF');
  }

  changeView(v: string): void{
    this.currentView = v as ViewType;
    this.storeNavService.changeView(v);
  }

  goToItemDetails(itemId: number): void {
    const storeUrl = this.storeData?.url || '';
    this.router.navigate([`${storeUrl}/item`, itemId]);
    //this.storeNavService.changeView('item');
  }


  extractViewFromUrl(url: string): ViewType {
    const segments = url.split('/'); // Split URL by "/"

    if (segments.length > 1) {
      const view = segments[1];
      // Check if view is one of our allowed ViewType values
      if (view === 'cart' || view === 'checkout') {
        return view;
      }
    }

    return 'store-page'; // Default to store-page if no view is specified
  }

  // Helper methods to check currentView type
  isStorePageView(): boolean {
    return this.currentView === 'store-page';
  }

  isCartView(): boolean {
    return this.currentView === 'cart';
  }

  isCheckoutView(): boolean {
    return this.currentView === 'checkout';
  }

  isItemView(): boolean {
    const result: boolean = this.currentView.split("/")[0] === 'item';
    //console.log(result + " " + this.currentView);
    return result;
  }

  isCategoryView(categoryName: string): boolean {
    return this.currentView === categoryName;
  }

  updateStoreTheme(storeData: StoreDetails): void {
    if (!storeData) return;
    
    this.storeTheme = {
      mainColor: storeData.theme_1,
      secondColor: storeData.theme_2,
      thirdColor: storeData.theme_3,
      altColor: storeData.fontColor,
      mainFontFam: storeData.fontFamily
    };
  }

}
