import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../../../models/category';
import { StoreDetails } from '../../../models/store-details';
import { CategoryService } from '../../../services/category.service';
import { ItemCardComponent } from "../../item-card/item-card.component";
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-category-page',
  imports: [ItemCardComponent, NgFor, NgIf],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit {

  @Input() category: Category | null = null;
  /* @Input() store: StoreDetails | null = null; */

  itemIds: number[] = [];

  constructor(private catService: CategoryService){

  }


  ngOnInit(): void {
    if (this.category)
      this.itemIds = this.catService.getItemsInCategory(this.category?.categoryId, this.category?.storeId);
    //throw new Error('Method not implemented.');
  }

}
