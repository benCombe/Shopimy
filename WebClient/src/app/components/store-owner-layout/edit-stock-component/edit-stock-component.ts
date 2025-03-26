import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoreService } from '../../../services/store.service';
import { Item } from '../../../models/item';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-stock',
  templateUrl: './edit-stock.component.html',
  styleUrls: ['./edit-stock.component.scss'],
  standalone: true,
  // Import ReactiveFormsModule and any other modules if needed.
})
export class EditStockComponent implements OnInit {
  stockForm: FormGroup;
  itemId!: string;
  currentItem!: Item;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private route: ActivatedRoute
  ) {
    this.stockForm = this.fb.group({
      quantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Get the item id from the route parameters (if editing from a detail view)
    this.itemId = this.route.snapshot.paramMap.get('id')!;
    
    // Optionally, load current item details to pre-populate the form
    this.storeService.getItemById(this.itemId).subscribe(item => {
      this.currentItem = item;
      this.stockForm.patchValue({ quantity: item.QuantityInStock });
    });
  }

  onSubmit(): void {
    if (this.stockForm.invalid) {
      return;
    }
    const newStock = this.stockForm.value.quantity;
    this.storeService.updateStock(this.itemId, newStock).subscribe(updatedItem => {
      // Handle success, maybe show a confirmation message
      alert('Stock updated successfully!');
      // Optionally, refresh local item data or navigate away.
    }, error => {
      // Handle errors
      console.error('Error updating stock', error);
    });
  }
}
