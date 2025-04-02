import { Component, OnInit } from '@angular/core';
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


@Component({
  selector: 'app-store-owner-dashboard',
  standalone: true,
  imports: [
    SideNavComponent,
    OverviewComponent,
    ProfileComponent,
    NgIf,
    SettingsComponent,
    ProductManagementComponent,
    OrdersComponent,
    ThemesComponent,
    PromotionsComponent,
    AnalyticsComponent,
  ],
  templateUrl: './store-owner-dashboard.component.html',
  styleUrl: './store-owner-dashboard.component.css'
})

export class StoreOwnerDashboardComponent {

  user: User | null | undefined;

  currentPage: string = "Overview"; //default page

  constructor(private userService: UserService) {}

  ngOnInit(){
    this.userService.activeUser$.subscribe(u =>{
      this.user = u;
    })
  }

  onPageChange(newPage: string){
    this.currentPage = newPage;
    console.log("Navigatiing To: ", newPage);
  }

}
