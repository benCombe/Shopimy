
import { ThemeService } from './../../../services/theme.service';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../models/item';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { StoreService } from '../../../services/store.service';
import { StoreDetails } from '../../../models/store-details';
import { StoreNavService } from '../../../services/store-nav.service';

@Component({
  selector: 'app-shopping-cart',
  imports: [StoreNavComponent],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css'
})



export class ShoppingCartComponent implements AfterViewInit, OnInit {

  @Input() storeDetails: StoreDetails | null = null;

  //storeDetails: StoreDetails | null = null;
  cartItem: Item[] = [];
  subtotal: number = 0.00;

  tempImages: string[] = ["resources/images/sweater-sample.jpg", "resources/images/sweater-sample2.jpg"]

  constructor(private storeService: StoreService,  private storeNavService: StoreNavService) {}


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

  addToUrl(segment: string): void {
    /* this.router.navigate([segment], { relativeTo: this.route });
    this.ViewChanged.emit(segment);
    console.log(segment); */
    this.storeNavService.changeView(segment);
  }


}
