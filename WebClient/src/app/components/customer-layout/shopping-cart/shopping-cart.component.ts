import { ThemeService } from './../../../services/theme.service';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../models/item';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { StoreService } from '../../../services/store.service';
import { StoreDetails } from '../../../models/store-details';
import { StoreNavService } from '../../../services/store-nav.service';
import { ShoppingService } from '../../../services/shopping.service';
import { BasicItem } from '../../../models/basic-item';
import { NgFor, NgIf } from '@angular/common';
import { OrderSummaryComponent } from "../order-summary/order-summary.component";

@Component({
  selector: 'app-shopping-cart',
  imports: [NgFor, NgIf, OrderSummaryComponent],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css'
})



export class ShoppingCartComponent implements AfterViewInit, OnInit {

  @Input() storeDetails: StoreDetails | null = null;

  //storeDetails: StoreDetails | null = null;
  cartItems: { item: BasicItem, quantity: number }[] = [];
  subtotal: number = 0.00;
  shippingCost: number = 0;

 // tempImages: string[] = ["resources/images/sweater-sample.jpg", "resources/images/sweater-sample2.jpg"]

  constructor(
    private storeService: StoreService,
    private storeNavService: StoreNavService,
    private shopService: ShoppingService,
  ) {}


  ngOnInit(): void {
    this.storeService.activeStore$.subscribe(s =>{
      this.storeDetails = s;
    });

    this.shopService.Cart$.subscribe(cart => {
      this.cartItems = cart;
      cart.forEach(i => {
        console.log(i.item.name + " ("+ i.quantity +")")
      });
    });
    this.shopService.SubTotal$.subscribe(total => {
      this.subtotal = total;
      if (this.subtotal < 30){
        this.shippingCost = 10;
      }
      else{
        this.shippingCost = 0;
      }
    });
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


  removeFromCart(item: BasicItem): void {
    this.shopService.removeFromCart(item);
  }

  increaseQuantity(item: BasicItem){
    this.shopService.updateItemQuantity(item, 1);
  }

  decreaseQuantity(item: BasicItem){
    this.shopService.updateItemQuantity(item, -1);
  }



}
