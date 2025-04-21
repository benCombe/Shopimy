import { Component, Input } from '@angular/core';
import { BasicItem } from '../../../models/basic-item';
import { StoreService } from '../../../services/store.service';
import { StoreNavService } from '../../../services/store-nav.service';
import { ShoppingService } from '../../../services/shopping.service';
import { StoreDetails } from '../../../models/store-details';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-order-summary',
  imports: [NgIf],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {

    @Input() storeDetails: StoreDetails | null = null;

    cartItems: { item: BasicItem, quantity: number }[] = [];
    subtotal: number = 0.00;
    shippingCost: number = 0;

    submitMessage: string = "Checkout";

    currentView: string = "";

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
      this.storeNavService.currentUrl$.subscribe(v =>{
        this.currentView = this.extractViewFromUrl(v);
        if(this.currentView == 'cart'){
          this.submitMessage = "Checkout"
        }
        else if (this.currentView == 'checkout'){
          this.submitMessage = "Submit Order"
        }
      })
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
