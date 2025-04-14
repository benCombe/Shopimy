import { StoreNavService } from './../../../services/store-nav.service';
import { StoreService } from './../../../services/store.service';
import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../../../models/category';
import { StoreDetails } from '../../../models/store-details';
import { CategoryService } from '../../../services/category.service';
import { ItemCardComponent } from "../../item-card/item-card.component";
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-category-page',
  imports: [ItemCardComponent, NgFor, NgIf],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit {

  @Input() category: Category | null = null;
  @Input() storeDetails: StoreDetails | null = null;

  categoryName: string | null = "";

  /* @Input() store: StoreDetails | null = null; */

  itemIds: number[] = [];

  constructor(
    private catService: CategoryService,
    private storeService: StoreService,
    private storeNavService: StoreNavService,
    private route: ActivatedRoute
  )
  {

  }


  ngOnInit(): void {
    //console.log("Category Page Initialized!!! (" + this.category?.name + ")");
    if (!this.category || !this.storeDetails) {
      //console.log("Don;t have store details or category");
    }
    else{
      this.catService.getItemsInCategory(this.category.categoryId, this.storeDetails.id).subscribe(data => {
        this.itemIds = data;
        //console.log(this.itemIds);
      });
    }

    /* this.storeNavService.viewChanged$.subscribe(view => {
      if(view === this.category?.name){
        console.log(this.category?.name + " Page Opened!!!");
      }
    }); */
    /* this.route.paramMap.subscribe(params => {
      const storeUrl = params.get('storeUrl'); // Use 'storeUrl' as defined in routes
      this.categoryName = params.get('category');
      if (storeUrl && this.storeDetails?.url !== storeUrl) {
        this.storeService.getStoreDetails(storeUrl).subscribe({
          next: (data) => {
            this.storeDetails = data;
            this.storeNavService.initialize();
            if (this.categoryName)
              this.category = this.storeService.getCategoryByName(this.categoryName);
            if (this.category)
              this.catService.getItemsInCategory(this.category.categoryId, this.storeDetails.id).subscribe(data => {
                this.itemIds = data;
              });
            //console.log("STORE DATA: " + data);
          },
          error: (err) => console.error('Failed to load store:', err)
        });
      }
    }); */


    // Combine both observables to avoid nested subscriptions
   /*  combineLatest([
      this.route.params,
      this.storeService.activeStore$
    ])
    .pipe(
      map(([params, store]) => {
        this.categoryName = params['category'];
        this.storeDetails = store;
        console.log("Store Details:", this.storeDetails);

        return store?.categories.find(cat => cat.name === this.categoryName) ?? null;
      })
    )
    .subscribe(category => {
      this.category = category;
      if (this.category) {
        this.itemIds = this.catService.getItemsInCategory(this.category.categoryId, this.category.storeId);
      }
    }); */
  }

  onPageOpen(): void {
    console.log("Category Page Opened");
  }

}
