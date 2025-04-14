import { Component, OnInit, Output } from '@angular/core';
import { TopNavComponent } from "../../top-nav/top-nav.component";
import { SideNavComponent } from "../side-nav/side-nav.component";
import { NgClass, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';
import { OverviewComponent } from "../overview/overview.component";
import { ProfileComponent } from "../profile/profile.component";
import { ProductManagementComponent } from "../product-management/product-management.component";
import { PromotionsComponent, PromoCodeData, PromoMessageData } from "../promotions/promotions.component";
import { OrdersComponent } from '../orders/orders.component';
import { SettingsComponent, PaymentInfo } from '../settings/settings.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { ThemesComponent } from '../themes/themes.component';
import { SalesComponent } from '../sales/sales.component';

import { StoreDetails } from '../../../models/store-details';
import { StoreService } from '../../../services/store.service';
import { Item } from '../../../models/item';
import { ItemService } from '../../../services/item.service';
import { ThemeService } from '../../../services/theme.service';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';

// Moved interfaces from analytics component
interface AnalyticsData {
  order: string;
  customer: string;
  total: string;
  items: string;
  payment: string;
  fulfilled: string;
}

interface ChartDataPoint {
  day: string;
  visitors: number;
}

interface SalesDataPoint {
  label: string;
  amount: number;
}

// Sales component interfaces
interface MonthlySales {
  month: string;
  amount: number;
}

interface CategorySales {
  category: string;
  percentage: number;
  color: string;
}

interface SalesData {
  orderId: string;
  date: string;
  customer: string;
  items: number;
  amount: string;
  status: string;
}

interface ProductData {
  rank: number;
  product: string;
  category: string;
  unitsSold: number;
  revenue: string;
}

// Moved interfaces from orders component
interface OrderSummary {
  totalSales: string;
  orders: number;
  items: number;
  fulfilledOrders: number;
}

interface OrderDetail {
  order: string;
  customer: string;
  total: string;
  items: number;
  payment: string;
  fulfilled: string;
}

let ITEM_DATA: Item[] = [
  {Id: '1', Name: 'Phone', OriginalPrice: 100, SalePrice: 90, OnSale: true, Description: 'This is a Phone', QuantityInStock: 10, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 5, CategoryIds: [1], ImageUrl: 'assets/images/default.png'},
    {Id: '2', Name: 'T-Shirt', OriginalPrice: 200, SalePrice: 180, OnSale: true, Description: 'This is a T-Shirt', QuantityInStock: 20, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 4, CategoryIds: [2], ImageUrl: 'assets/images/default.png'},
    {Id: '3', Name: 'Stand Mixer', OriginalPrice: 300, SalePrice: 270, OnSale: true, Description: 'This is Stand Mixer', QuantityInStock: 30, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 3, CategoryIds: [3], ImageUrl: 'assets/images/default.png'},
    {Id: '4', Name: 'Ave Maria: The Book', OriginalPrice: 500, SalePrice: 360, OnSale: true, Description: 'This is soft cover book', QuantityInStock: 40, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 2, CategoryIds: [4], ImageUrl: 'assets/images/default.png'},
    {Id: '4', Name: 'Item 4', OriginalPrice: 500, SalePrice: 360, OnSale: true, Description: 'This is item 4', QuantityInStock: 40, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 2, CategoryIds: [4], ImageUrl: 'assets/images/default.png'},
    {Id: '4', Name: 'Item 4', OriginalPrice: 500, SalePrice: 360, OnSale: true, Description: 'This is item 4', QuantityInStock: 40, AvailFrom: new Date(), AvailTo: new Date(), CurrentRating: 2, CategoryIds: [4], ImageUrl: 'assets/images/default.png'},
  
];

let CAT_DATA: Category[] = [
    { categoryId: 1, storeId: 1, name: 'Electronics', parentCategory: null, subCategories: [] },
    { categoryId: 2, storeId: 1, name: 'Clothing', parentCategory: null, subCategories: [] },
    { categoryId: 3, storeId: 1, name: 'Home Appliances', parentCategory: null, subCategories: [] },
    { categoryId: 4, storeId: 1, name: 'Books', parentCategory: null, subCategories: [] },
    { categoryId: 5, storeId: 1, name: 'Sports', parentCategory: null, subCategories: [] }
];

// Sample order details data - moved from orders component
let ORD_DATA: OrderDetail[] = [
  {
    order: '#ORD-2023-001',
    customer: 'John Smith',
    total: '$128.99',
    items: 3,
    payment: 'Credit Card',
    fulfilled: 'Yes'
  },
  {
    order: '#ORD-2023-002',
    customer: 'Sarah Johnson',
    total: '$85.50',
    items: 2,
    payment: 'PayPal',
    fulfilled: 'Yes'
  },
  {
    order: '#ORD-2023-003',
    customer: 'Michael Brown',
    total: '$210.75',
    items: 4,
    payment: 'Credit Card',
    fulfilled: 'Yes'
  },
  {
    order: '#ORD-2023-004',
    customer: 'Emily Davis',
    total: '$159.99',
    items: 1,
    payment: 'Debit Card',
    fulfilled: 'No'
  },
  {
    order: '#ORD-2023-005',
    customer: 'Robert Wilson',
    total: '$324.50',
    items: 5,
    payment: 'Credit Card',
    fulfilled: 'Yes'
  },
  {
    order: '#ORD-2023-006',
    customer: 'Jennifer Taylor',
    total: '$75.25',
    items: 2,
    payment: 'PayPal',
    fulfilled: 'Yes'
  }
];

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
    ThemesComponent,
    SalesComponent
  ],
  templateUrl: './store-owner-dashboard.component.html',
  styleUrl: './store-owner-dashboard.component.css',
})



export class StoreOwnerDashboardComponent {

    
  user: User | null | undefined;
  //storeDetails: StoreDetails | null | undefined;
  item: Item | null | undefined;
  theme: StoreDetails | null | undefined; //theme data for the dashboard
  category: Category | null | undefined; //category data for the dashboard

  storeDetails = new StoreDetails(1, '', 'My Store', '#cccccc', '#808080', '#ffffff', '#000000', 'Calibri', '', '', []);
  productData: Item[] = ITEM_DATA;      //data for product tables
  categoryData: Category[] = CAT_DATA;  //data for category tables
  orderData: OrderDetail[] = ORD_DATA;  //data for order tables - updated to use OrderDetail interface
  
  // Visitor data for the last 7 days - moved from overview component
  visitorData = [
    { day: 'Mon', count: 120 },
    { day: 'Tue', count: 150 },
    { day: 'Wed', count: 200 },
    { day: 'Thu', count: 180 },
    { day: 'Fri', count: 250 },
    { day: 'Sat', count: 300 },
    { day: 'Sun', count: 210 }
  ];
  
  // Analytics data - moved from analytics component
  analyticDataSource1: AnalyticsData[] = []; // Data for Recent Purchase table
  analyticDataSource2: AnalyticsData[] = []; // Data for Popular Items table
  visitData: ChartDataPoint[] = [];          // Store visits data
  annualSalesData: SalesDataPoint[] = [];    // Annual sales data
  currentMonthData: SalesDataPoint[] = [];   // Current month sales data
  previousMonthData: SalesDataPoint[] = [];  // Previous month sales data
  
  // Sales data - moved from sales component
  // Summary metrics
  totalSales: number = 42680.50;
  totalOrders: number = 187;
  averageOrderValue: number = 228.24;
  conversionRate: number = 3.2;
  
  // Bar chart data
  monthlySalesData: MonthlySales[] = [
    { month: 'Jan', amount: 3200 },
    { month: 'Feb', amount: 4500 },
    { month: 'Mar', amount: 5200 },
    { month: 'Apr', amount: 6800 },
    { month: 'May', amount: 8900 },
    { month: 'Jun', amount: 14000 }
  ];

  // Pie chart data
  categorySalesData: CategorySales[] = [
    { category: 'Electronics', percentage: 35, color: '#FF6384' },
    { category: 'Clothing', percentage: 25, color: '#36A2EB' },
    { category: 'Home Goods', percentage: 20, color: '#FFCE56' },
    { category: 'Books', percentage: 15, color: '#4BC0C0' },
    { category: 'Other', percentage: 5, color: '#9966FF' }
  ];
  
  // Table data
  salesTableData: SalesData[] = [
    { orderId: '#12345', date: '2023-05-15', customer: 'John Smith', items: 3, amount: '$125.99', status: 'Completed' },
    { orderId: '#12346', date: '2023-05-16', customer: 'Sarah Johnson', items: 1, amount: '$59.99', status: 'Completed' },
    { orderId: '#12347', date: '2023-05-16', customer: 'Michael Williams', items: 2, amount: '$89.50', status: 'Processing' },
    { orderId: '#12348', date: '2023-05-17', customer: 'Jessica Brown', items: 5, amount: '$210.75', status: 'Completed' },
    { orderId: '#12349', date: '2023-05-18', customer: 'David Miller', items: 2, amount: '$45.00', status: 'Shipped' },
  ];
  
  productsTableData: ProductData[] = [
    { rank: 1, product: 'Wireless Headphones', category: 'Electronics', unitsSold: 145, revenue: '$10,875.00' },
    { rank: 2, product: 'Smart Watch', category: 'Electronics', unitsSold: 98, revenue: '$9,800.00' },
    { rank: 3, product: 'Running Shoes', category: 'Clothing', unitsSold: 112, revenue: '$6,720.00' },
    { rank: 4, product: 'Coffee Maker', category: 'Home Goods', unitsSold: 67, revenue: '$5,360.00' },
    { rank: 5, product: 'Backpack', category: 'Accessories', unitsSold: 89, revenue: '$3,115.00' },
  ];
  
  currentPage: string = "Overview"; //default page

  // Add properties to store promotion data
  promoCodesCreated: PromoCodeData[] = [];
  promoMessagesSent: PromoMessageData[] = [];

  // Add property to store payment information
  paymentInformation: PaymentInfo | null = null;

  constructor(
              private userService: UserService,
              private storeService: StoreService,
              private itemService: ItemService,
              private themeService: ThemeService,
              private categoryService: CategoryService
            ) {}

    

  ngOnInit(){
    this.userService.activeUser$.subscribe(u =>{
      this.user = u;
    });
    
    this.storeService.activeStore$.subscribe(sd =>{
      this.storeDetails = sd;
    });

    this.itemService.activeItem$.subscribe(i =>{
      this.item = i;
    });

    this.themeService.activeTheme$.subscribe(t =>{
      this.theme = t;
    });

    this.categoryService.activeCategory$.subscribe(c =>{
      this.category = c;
    });

    
    // Load items when component initializes
    this.loadItems();
    
    // Generate analytics data
    this.generateAnalyticsData();
  }

  // Generate analytics data
  generateAnalyticsData() {
    // Generate Recent Purchase data
    this.analyticDataSource1 = [
      {order: 'ORD001', customer: 'John Doe', total: '$120.99', items: '3', payment: 'Credit Card', fulfilled: 'Yes'},
      {order: 'ORD002', customer: 'Jane Smith', total: '$85.50', items: '2', payment: 'PayPal', fulfilled: 'Yes'},
      {order: 'ORD003', customer: 'Robert Johnson', total: '$210.75', items: '5', payment: 'Credit Card', fulfilled: 'No'},
      {order: 'ORD004', customer: 'Emily Davis', total: '$45.99', items: '1', payment: 'Cash', fulfilled: 'Yes'},
    ];
    
    // Generate Popular Items data
    this.analyticDataSource2 = [
      {order: 'ITEM001', customer: 'T-Shirt', total: '$29.99', items: '150', payment: '15%', fulfilled: 'Clothing'},
      {order: 'ITEM002', customer: 'Smartphone Case', total: '$15.99', items: '120', payment: '12%', fulfilled: 'Accessories'},
      {order: 'ITEM003', customer: 'Water Bottle', total: '$12.50', items: '100', payment: '10%', fulfilled: 'Lifestyle'},
      {order: 'ITEM004', customer: 'Notebook', total: '$8.99', items: '90', payment: '9%', fulfilled: 'Stationery'},
    ];
    
    // Generate store visits data
    this.visitData = [
      { day: 'Mon', visitors: 65 },
      { day: 'Tue', visitors: 72 },
      { day: 'Wed', visitors: 58 },
      { day: 'Thu', visitors: 80 },
      { day: 'Fri', visitors: 92 },
      { day: 'Sat', visitors: 120 },
      { day: 'Sun', visitors: 85 }
    ];
    
    // Generate annual sales data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.annualSalesData = months.map(month => {
      return { 
        label: month, 
        amount: Math.floor(Math.random() * 50000) + 30000 
      };
    });
    
    // Generate monthly sales data
    this.currentMonthData = Array.from({length: 30}, (_, i) => {
      return {
        label: (i + 1).toString(),
        amount: Math.floor(Math.random() * 3000) + 1000
      };
    });
    
    this.previousMonthData = Array.from({length: 30}, (_, i) => {
      return {
        label: (i + 1).toString(),
        amount: Math.floor(Math.random() * 2800) + 800
      };
    });
  }

  onPageChange(newPage: string){
    this.currentPage = newPage;
    console.log("Navigatiing To: ", newPage);
  }
  
  /**
   * Loads items from the ItemService and updates the productData array
   * for displaying in tables
   */
  loadItems() {
    // Check if store ID is available
    if (this.storeDetails?.id) {
      this.itemService.getItems().subscribe({
        next: (items) => {
          this.productData = items;
          console.log('Items loaded successfully:');
        },
        error: (error) => {
          console.error('Error loading items:', error);
          // Fallback to sample data in case of error
          this.productData = ITEM_DATA;
        }
      });
    } else {
      // If no store ID is available yet, use sample data
      console.log('No store ID available, using sample data');
      this.productData = ITEM_DATA;
    }


  }
  updateStore(store: StoreDetails) {
    this.storeDetails = store;
    this.themeService.setThemeOne(this.storeDetails.theme_1);
    this.themeService.setThemeTwo(this.storeDetails.theme_2);
    this.themeService.setThemeThree(this.storeDetails.theme_3);
    this.themeService.setFontColor(this.storeDetails.fontColor);
    this.themeService.setFontFamily(this.storeDetails.fontFamily);
    this.themeService.setBannerText(this.storeDetails.bannerText);
    this.themeService.setLogoText(this.storeDetails.logoText);
    this.themeService.setLogoUrl(this.storeDetails.LogoUrl || '');
    this.themeService.setBannerUrl(this.storeDetails.BannerUrl || '');
    
    console.log('Store details updated:', this.storeDetails);
  }

  // Handle promo code creation event
  handlePromoCodeCreated(promoData: PromoCodeData) {
    this.promoCodesCreated.push(promoData);
    console.log('Promo code created in dashboard:', promoData);
    // Here you can add additional logic like API calls to save the promo code
  }

  // Handle promo message sent event
  handlePromoMessageSent(messageData: PromoMessageData) {
    this.promoMessagesSent.push(messageData);
    console.log('Promo message sent from dashboard:', messageData);
    // Here you can add additional logic like API calls to send the promo message
  }

  // Handle payment info saved event
  handlePaymentInfoSaved(paymentInfo: PaymentInfo) {
    this.paymentInformation = paymentInfo;
    console.log('Payment information saved in dashboard:', paymentInfo);
    // Here you can add additional logic like API calls to save the payment information to the server
  }

}
