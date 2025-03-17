import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Item } from '../../models/item';
import { ItemService } from '../../services/item.service';
import { BasicItem } from '../../models/basic-item';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ItemCardComponent implements OnInit {
  @Input() itemId: number | null = null; // Ticket requires itemId as input
  item: BasicItem | null = null;

  constructor(private itemService: ItemService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchItem();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemId'] && changes['itemId'].currentValue !== changes['itemId'].previousValue) {
      this.fetchItem();
    }
  }

  private fetchItem(): void{
    if (this.itemId) {
      console.log("Fetching item with ID:", this.itemId);
      this.itemService.getItemById(this.itemId).subscribe(
        (data: any) => {
          console.log("Raw Data:", data);

          // Extract the first item if API response is wrapped in an object or array
          if (Array.isArray(data)) {
            this.item = data[0] || null; // Handle empty array case
          } else if (data && typeof data === 'object' && data[0]) {
            this.item = data[0]; // If wrapped in an object with index keys
          } else {
            this.item = data; // Fallback to default behavior
          }

          console.log("Updated Item:", this.item);
          this.cdr.detectChanges(); // Force UI update
        },
        error => console.error('Failed to load item ' + this.itemId + ': ', error)
      );
    }
  }


  addToBasket(item: BasicItem): void {
    console.log('Adding to basket:', item);
    // Implement your basket logic here
  }

  bookmarkItem(item: Item): void {
    console.log('Bookmarking item:', item);
    // Implement your bookmark logic here
  }
}
