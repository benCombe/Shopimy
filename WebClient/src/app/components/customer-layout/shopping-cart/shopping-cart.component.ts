import { ThemeService } from './../../../services/theme.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Item } from '../../../models/item';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { StoreDetails } from '../../../models/store-details';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-shopping-cart',
  imports: [StoreNavComponent],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css'
})



export class ShoppingCartComponent implements AfterViewInit, OnInit {

  storeDetails: StoreDetails | null = null;
  cartItem: Item[] = [];
  subtotal: number = 0.00;

  tempImages: string[] = ["resources/images/sweater-sample.jpg", "resources/images/sweater-sample2.jpg"]

  constructor(private storeService: StoreService) {}


  ngOnInit(): void {
    this.storeService.activeStore$.subscribe(s =>{
      this.storeDetails = s;
    })
  }


  ngAfterViewInit(): void {
    /* this.themeService.setThemeOne("theme1");
    this.themeService.setThemeTwo("theme2");
    this.themeService.setThemeThree("theme3");
    this.themeService.setFontColor("fc");
    this.themeService.setFontFamily('*:not(.fa-solid)');
    this.themeService.setButtonHoverColor("hover"); */
  }


}
