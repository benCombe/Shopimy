import { NgFor, NgIf, NgStyle } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { ThemeService } from '../../../services/theme.service';
import { StoreService } from '../../../services/store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreDetails } from '../../../models/store-details';
import { Category } from '../../../models/category';
import { LoadingService } from '../../../services/loading.service';
import { ShoppingCartComponent } from "../shopping-cart/shopping-cart.component";
import { CheckoutComponent } from "../checkout/checkout.component";
import { StoreNavService } from '../../../services/store-nav.service';
import { CategoryPageComponent } from '../category-page/category-page.component';
import { ItemCardComponent } from "../../item-card/item-card.component";
import { ItemPageComponent } from "../item-page/item-page.component";
import { ItemDetailComponent } from "../../item-detail/item-detail.component";

// Using a more flexible type that allows category names while maintaining type safety for known values
type ViewType = 'store-page' | 'cart' | 'checkout' | string;

@Component({
  selector: 'app-store-page',
  standalone: true,
  imports: [NgFor, NgIf, NgStyle, StoreNavComponent, ShoppingCartComponent, CheckoutComponent, CategoryPageComponent, ItemCardComponent, ItemDetailComponent],
  templateUrl: './store-page.component.html',
  styleUrl: './store-page.component.css'
})

export class StorePageComponent implements AfterViewInit, OnInit{

  storeData: StoreDetails | null = null;
  currentUrl: string = "";
  currentView: ViewType = "store-page";
  currentItemView: number = 0;

  loadingStore: boolean = false;

  itemIds: number[] = [];
  displayCount: number = 9;
  storePageHeight: number = 175;
  isMobile: boolean = false;
  initialLoad: boolean = true;

  currentBannerUrl: string = '';
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
    if(window.innerWidth < 900){
      this.storePageHeight = 400;
      this.isMobile = true;
    }
    else{
      this.storePageHeight = 400;
      this.isMobile = false;
    }
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

            this.fetchItemIds(this.storeData.id);
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
      this.applyStoreTheme(this.storeData);
    }
  }

  // New method to apply the store theme
  applyStoreTheme(storeData: StoreDetails): void {
    // Update theme service with store details
    if (!storeData) return;

    // Apply theme to root elements with CSS classes
    this.themeService.setThemeOne('theme1');
    this.themeService.setThemeTwo('theme2');
    this.themeService.setThemeThree('theme3');
    this.themeService.setFontColor('fc');
    this.themeService.setButtonHoverColor('hover');
    this.themeService.setFontFamily('body');

    // Also apply theme variables to :root for global CSS access
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--main-color', storeData.theme_1);
    rootStyle.setProperty('--second-color', storeData.theme_2);
    rootStyle.setProperty('--third-color', storeData.theme_3);
    rootStyle.setProperty('--alt-color', storeData.fontColor);
    rootStyle.setProperty('--main-font-fam', storeData.fontFamily);
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

  fetchItemIds(storeId: number): void {
    this.storeService.getRandomItemIdsByStore(storeId).subscribe({
      next: (ids) => {
        this.itemIds = ids;
        //console.log('Received item IDs:', this.itemIds);
      },
      error: (err) => console.error('Error fetching item IDs:', err)
    });
  }


  loadMore(){
    if (this.displayCount < this.itemIds.length){
      this.displayCount = Math.min(this.displayCount + 9, this.itemIds.length);
      this.storePageHeight += this.isMobile ? 300 : 100;
    }
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
    var result: boolean = this.currentView.split("/")[0] === 'item';
    //console.log(result + " " + this.currentView);
    return result;
  }

  isCategoryView(categoryName: string): boolean {
    return this.currentView === categoryName;
  }

}
