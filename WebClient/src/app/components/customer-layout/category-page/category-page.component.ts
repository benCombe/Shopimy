import { StoreNavService } from './../../../services/store-nav.service';
import { StoreService } from './../../../services/store.service';
import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../../../models/category';
import { StoreDetails } from '../../../models/store-details';
import { CategoryService } from '../../../services/category.service';
import { ItemCardComponent } from "../../item-card/item-card.component";
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../../services/item.service';
import { BasicItem } from '../../../models/basic-item';
import { StoreTheme } from '../../../models/store-theme.model';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [CommonModule, ItemCardComponent],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit {

  @Input() category: Category | null = null;
  @Input() storeDetails: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;

  categoryName: string = '';
  items: BasicItem[] = [];
  itemsLoaded: boolean = false;

  constructor(
    private catService: CategoryService,
    private storeService: StoreService,
    private storeNavService: StoreNavService,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService
  ) {}


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const categoryId = params['id'];
      if (categoryId) {
        this.loadCategoryItems(categoryId);
      } else {
        if (this.category) {
          this.categoryName = this.category.name;
          this.loadCategoryItems(this.category.categoryId.toString());
        } else {
          console.error('Category ID not found in route params and no category input provided.');
          this.itemsLoaded = true;
        }
      }
    });
  }

  private loadCategoryItems(categoryId: string): void {
    this.itemsLoaded = false;
    this.items = [];
    const storeId = this.storeDetails?.id || 1;
    this.catService.getItemsInCategory(Number(categoryId), storeId).subscribe({
      next: (itemIds: number[]) => {
        if (itemIds.length === 0) {
          this.itemsLoaded = true;
          return;
        }
        itemIds.forEach((id, index) => {
          this.itemService.getItemById(id).subscribe({
            next: (item: BasicItem) => {
              this.items.push(item);
              if (index === 0) {
                this.categoryName = item.name;
              }
              if (this.items.length === itemIds.length) {
                this.itemsLoaded = true;
              }
            },
            error: (error: any) => {
              console.error('Error loading item:', id, error);
              if (index === itemIds.length - 1) {
                  this.itemsLoaded = true;
              }
            }
          });
        });
      },
      error: (error: any) => {
        console.error('Error loading category items:', error);
        this.itemsLoaded = true;
      }
    });
  }

  navigateToItem(itemId: number): void {
    const storeUrl = this.storeDetails?.url || this.route.snapshot.parent?.params['storeUrl'];
    if (storeUrl) {
      this.router.navigate(['/store', storeUrl, 'item', itemId]);
    } else {
      this.router.navigate(['/item', itemId]);
    }
  }

}
