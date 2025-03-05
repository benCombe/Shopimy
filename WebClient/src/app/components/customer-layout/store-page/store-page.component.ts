import { NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { ThemeService } from '../../../services/theme.service';
import { StoreService } from '../../../services/store.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreDetails } from '../../../models/store-details';
import { Category } from '../../../models/category';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-store-page',
  imports: [NgFor, NgIf, StoreNavComponent],
  templateUrl: './store-page.component.html',
  styleUrl: './store-page.component.css'
})

export class StorePageComponent implements AfterViewInit, OnInit{

  storeData: StoreDetails | null = null;

  constructor(
    private route:ActivatedRoute,
    private router: Router,
    private themeService: ThemeService,
    private storeService: StoreService,
    private loadingService: LoadingService
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
            console.log("STORE DATA: " + data);
          },
          error: (err) => console.error('Failed to load store:', err)
        });
      }
    });
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



}
