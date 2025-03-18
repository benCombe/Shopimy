import { Component, Input } from '@angular/core';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { NgFor, NgIf } from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import { Item } from '../../../models/item';
import { StoreDetails } from '../../../models/store-details';
import { Category } from '../../../models/category';

let ITEM_DATA: Item[] = [];
let CAT_DATA: Category[] = [];

@Component({
  selector: 'app-product-management',
  imports: [NgFor, NgIf, MatTableModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})

export class ProductManagementComponent {
    @Input() user: User | null | undefined;
    @Input() storeDetails: StoreDetails | null | undefined;
    @Input() productData = ITEM_DATA; // = Data for Product table 
    @Input() categoryData = CAT_DATA; // Data for Category table
    
    displayedColumns: string[] = ['Id', 'Name', 'OriginalPrice', 'QuantityInStock', 'CategoryIds'];

}
