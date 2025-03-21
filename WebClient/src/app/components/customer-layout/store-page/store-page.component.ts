import { NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-store-page',
  imports: [NgFor, NgIf, StoreNavComponent, ShoppingCartComponent, CheckoutComponent, CategoryPageComponent],
  templateUrl: './store-page.component.html',
  styleUrl: './store-page.component.css'
})

export class StorePageComponent implements AfterViewInit, OnInit{

  storeData: StoreDetails | null = null;
  currentUrl: string = "";
  currentView: string = "";

  constructor(
    private route:ActivatedRoute,
    private router: Router,
    private themeService: ThemeService,
    private storeService: StoreService,
    private loadingService: LoadingService,
    private storeNavService: StoreNavService
  ){}


  ngOnInit(): void {
    this.loadingService.setIsLoading(true);
    this.route.paramMap.subscribe(params => {
      const storeUrl = params.get('storeUrl'); // Use 'storeUrl' as defined in routes
      console.log("Fetching for " + storeUrl);
      if (storeUrl) {
        this.storeService.getStoreDetails(storeUrl).subscribe({
          next: (data) => {
            this.storeData = data;
            this.storeNavService.initialize();
            console.log("STORE DATA: " + data);
          },
          error: (err) => console.error('Failed to load store:', err)
        });
      }
    });

    this.storeNavService.currentUrl$.subscribe(u =>{
      this.currentUrl = u;
      this.currentView = this.extractViewFromUrl(u);
      console.log("CURRENT VIEW: "+this.currentView)

    })

    this.loadingService.setIsLoading(false);
  }




  ngAfterViewInit(): void {
    this.themeService.setThemeOne("theme1");
    this.themeService.setThemeTwo("theme2");
    this.themeService.setThemeThree("theme3");
    this.themeService.setFontColor("fc");
    this.themeService.setButtonHoverColor("hover")
  }


  //TEMPORARY
  arrayRange(n: number): number[] {
    return Array(n).fill(0).map((_, i) => i);
  }


  changeView(v: string): void{
    this.storeNavService.changeView(v);
  }

  extractViewFromUrl(url: string): string {
    const segments = url.split('/'); // Split URL by "/"

    if (segments.length > 1) {
      return segments[1]; // Get the second segment (everything after store-url)
    }

    return 'store-page'; // Default to store-page if no view is specified
  }

}
