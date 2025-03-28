import { Component, OnInit, Output } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { SideNavComponent } from "../side-nav/side-nav.component";
import { NgClass, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { OverviewComponent } from "../overview/overview.component";
import { ProfileComponent } from "../profile/profile.component";
import { ProductManagementComponent } from "../product-management/product-management.component";
import { PromotionsComponent } from "../promotions/promotions.component";
import { OrdersComponent } from '../orders/orders.component';
import { SettingsComponent } from '../settings/settings.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { ThemesComponent } from '../themes/themes.component';
import { SalesComponent } from '../sales/sales.component';
import { StoreDetails } from '../../../models/store-details';
import { StoreService } from '../../../services/store.service';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { Item } from '../../../models/item';
import { ItemService } from '../../../services/item.service';
import { Category } from '../../../models/category';

let ITEM_DATA: Item[] = [
  {Id: '1', Name: 'Item 1', OriginalPrice: 100, SalePrice: 90, OnSale: true, Description: 'This is item 1', QuantityInStock: 10, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 5, CategoryIds: [1], ImageUrl: 'assets/images/default.png'},
    {Id: '2', Name: 'Item 2', OriginalPrice: 200, SalePrice: 180, OnSale: true, Description: 'This is item 2', QuantityInStock: 20, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 4, CategoryIds: [2], ImageUrl: 'assets/images/default.png'},
    {Id: '3', Name: 'Item 3', OriginalPrice: 300, SalePrice: 270, OnSale: true, Description: 'This is item 3', QuantityInStock: 30, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 3, CategoryIds: [3], ImageUrl: 'assets/images/default.png'},
    {Id: '4', Name: 'Item 4', OriginalPrice: 500, SalePrice: 360, OnSale: true, Description: 'This is item 4', QuantityInStock: 40, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 2, CategoryIds: [4], ImageUrl: 'assets/images/default.png'},
    {Id: '4', Name: 'Item 4', OriginalPrice: 500, SalePrice: 360, OnSale: true, Description: 'This is item 4', QuantityInStock: 40, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 2, CategoryIds: [4], ImageUrl: 'assets/images/default.png'},
    {Id: '4', Name: 'Item 4', OriginalPrice: 500, SalePrice: 360, OnSale: true, Description: 'This is item 4', QuantityInStock: 40, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 2, CategoryIds: [4], ImageUrl: 'assets/images/default.png'},
  
];

let CAT_DATA: Category[] = [];
let ORD_DATA: Item[] = [];


@Component({
  selector: 'app-store-owner-dashboard',
  imports: [
    TopNavComponent,
    SideNavComponent,
    NgIf, 
    NgFor, 
    NgClass, 
    OverviewComponent, 
    ProfileComponent, 
    ProductManagementComponent, 
    PromotionsComponent, 
    OrdersComponent,
    SettingsComponent,
    AnalyticsComponent,
    ThemesComponent,
    SalesComponent,
    DynamicTableComponent
  ],
  templateUrl: './store-owner-dashboard.component.html',
  styleUrl: './store-owner-dashboard.component.css',
})



export class StoreOwnerDashboardComponent {

    
  user: User | null | undefined;
  storeDetails: StoreDetails | null | undefined;
  item: Item | null | undefined;
  
  productData: Item[] = ITEM_DATA;      //data for product tables
  categoryData: Category[] = CAT_DATA;  //data for category tables
  orderData: Item[] = ORD_DATA;         //data for order tables
  analyticDataSource1 = [];             //data for analytics tables
  analyticDataSource2 = [];
  currentPage: string = "Overview"; //default page


  

  constructor(private userService: UserService,
              private storeService: StoreService) {}

  ngOnInit(){
    this.userService.activeUser$.subscribe(u =>{
      this.user = u;
    });
    
    this.storeService.activeStore$.subscribe(sd =>{
      this.storeDetails = sd;
    });




  }

  onPageChange(newPage: string){
    this.currentPage = newPage;
    console.log("Navigatiing To: ", newPage);
  }

}
