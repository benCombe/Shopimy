import { ThemeService } from './../../../services/theme.service';
import { AfterViewInit, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Item } from '../../../models/item';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { StoreService } from '../../../services/store.service';
import { StoreDetails } from '../../../models/store-details';
import { StoreNavService } from '../../../services/store-nav.service';
import { ShoppingService } from '../../../services/shopping.service';
import { BasicItem } from '../../../models/basic-item';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderSummaryComponent } from "../order-summary/order-summary.component";
import { Subject, takeUntil } from 'rxjs';
import { StoreTheme } from '../../../models/store-theme.model';

@Component({
  selector: 'app-shopping-cart',
  imports: [NgFor, NgIf, OrderSummaryComponent, CommonModule, FormsModule],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css'
})

export class ShoppingCartComponent implements AfterViewInit, OnInit, OnDestroy {

  @Input() storeDetails: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;

  //storeDetails: StoreDetails | null = null;
  cartItems: { item: BasicItem, quantity: number }[] = [];
  subtotal: number = 0.00;
  shippingCost: number = 0;
  promoCode: string = '';
  promoMessage: string = '';
  promoSuccess: boolean = false;
  isStoreContext: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private storeService: StoreService,
    private storeNavService: StoreNavService,
    private shopService: ShoppingService,
    private themeService: ThemeService
  ) {}


  ngOnInit(): void {
    this.storeService.activeStore$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(s => {
      this.storeDetails = s;
      this.isStoreContext = !!s && s.id > 0;
    });

    this.shopService.Cart$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(cart => {
      this.cartItems = cart;
      cart.forEach(i => {
        console.log(i.item.name + " ("+ i.quantity +")")
      });
    });
    
    this.shopService.SubTotal$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(total => {
      this.subtotal = total;
      if (this.subtotal < 30){
        this.shippingCost = 10;
      }
      else{
        this.shippingCost = 0;
      }
    });
    
    // Subscribe to theme service to know when we're in store context
    this.themeService.inStoreContext$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(inStore => {
      this.isStoreContext = inStore;
    });
  }


  ngAfterViewInit(): void {
    // Apply theme if we have store details
    if (this.storeDetails && this.storeDetails.id > 0) {
      this.themeService.applyStoreTheme(this.storeDetails);
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  applyPromoCode(): void {
    if (!this.promoCode || this.promoCode.trim() === '') {
      this.promoMessage = 'Please enter a promo code';
      this.promoSuccess = false;
      return;
    }
    
    // Simple validation example - in a real app, this would call a service
    if (this.promoCode.toUpperCase() === 'WELCOME10') {
      // Apply 10% discount
      this.shopService.applyDiscount(0.10);
      this.promoMessage = 'Success! 10% discount applied';
      this.promoSuccess = true;
    } else if (this.promoCode.toUpperCase() === 'FREESHIP') {
      // Make shipping free
      this.shippingCost = 0;
      this.promoMessage = 'Success! Free shipping applied';
      this.promoSuccess = true;
    } else {
      this.promoMessage = 'Invalid promo code: ' + this.promoCode;
      this.promoSuccess = false;
    }
    
    // Clear the input after processing
    setTimeout(() => {
      if (this.promoSuccess) {
        this.promoCode = '';
      }
    }, 1500);
    
    // Auto-clear message after 5 seconds
    setTimeout(() => {
      this.promoMessage = '';
    }, 5000);
  }

}
