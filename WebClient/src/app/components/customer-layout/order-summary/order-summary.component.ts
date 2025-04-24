import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { BasicItem } from '../../../models/basic-item';
import { StoreService } from '../../../services/store.service';
import { StoreNavService } from '../../../services/store-nav.service';
import { ShoppingService } from '../../../services/shopping.service';
import { ThemeService } from '../../../services/theme.service';
import { StoreDetails } from '../../../models/store-details';
import { NgIf, NgClass } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreTheme } from '../../../models/store-theme.model';

@Component({
  selector: 'app-order-summary',
  imports: [NgIf, NgClass],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent implements OnInit, OnDestroy {

    @Input() storeDetails: StoreDetails | null = null;
    @Input() theme: StoreTheme | null = null;

    cartItems: { item: BasicItem, quantity: number }[] = [];
    subtotal: number = 0.00;
    shippingCost: number = 0;
    isStoreContext: boolean = false;

    submitMessage: string = "Checkout";
    currentView: string = "";
    
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
      
      this.storeNavService.currentUrl$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(v => {
        this.currentView = this.extractViewFromUrl(v);
        if(this.currentView == 'cart'){
          this.submitMessage = "Checkout"
        }
        else if (this.currentView == 'checkout'){
          this.submitMessage = "Submit Order"
        }
      });
      
      // Subscribe to theme service to know when we're in store context
      this.themeService.inStoreContext$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(inStore => {
        this.isStoreContext = inStore;
      });
    }
    
    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }

    nextStep(){
      console.log(this.currentView);
      if (this.currentView == 'cart'){
        this.storeNavService.changeView("checkout");
      }
      else{
        //Submit the order
      }
    }

    extractViewFromUrl(url: string): string {
      const segments = url.split('/'); // Split URL by "/"

      if (segments.length > 1) {
        return segments[1]; // Get the second segment (everything after store-url)
      }

      return 'store-page'; // Default to store-page if no view is specified
    }

    get totalEstimate(): number {
      return Math.round(((this.subtotal * 1.13) + this.shippingCost) * 100) / 100;
    }

    get taxEstimate(): number {
      return Math.round((this.subtotal * 0.13) * 100) / 100;
    }
}
