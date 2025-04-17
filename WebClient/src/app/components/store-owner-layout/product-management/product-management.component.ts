import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ItemService, ProductCreatePayload, ProductUpdatePayload, ProductVariantPayload } from '../../../services/item.service';
import { CategoryService, Category } from '../../../services/category.service';
import { StoreService } from '../../../services/store.service';
import { Item } from '../../../models/item';
import { BasicItem } from '../../../models/basic-item';
import { ProductListItem } from '../../../services/item.service';

// Interface for the product variant (Items)
interface ProductVariant {
  id?: number;
  price: number;
  salePrice?: number;
  quantity: number;
  type?: string;
  size?: string;
  color?: string;
}

// Interface for our combined Listing + Items model
interface Product {
  listId?: number;
  name: string;
  description: string;
  categoryId: number;
  storeId: number;
  variants: ProductVariant[];
  imageUrl?: string;
}

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  // Form for adding/editing products
  productForm: FormGroup;
  
  // Lists to hold data
  products: Product[] = [];
  categories: Category[] = [];
  
  // Current state tracking
  isLoading = false;
  isEditMode = false;
  currentProductId: number | null = null;
  isSaving = false;
  
  // Track store id
  storeId: number | null = null;
  
  // File and image handling
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  
  // Subscription management
  private storeSubscription: Subscription | null = null;
  
  // Reference to access Document object
  document = document;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private storeService: StoreService
  ) {
    // Initialize the form
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    // Subscribe to active store to get the store ID
    this.storeSubscription = this.storeService.activeStore$.subscribe(store => {
      if (store) {
        this.storeId = store.id;
        this.loadProducts();
        this.loadCategories();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }

  // Initialize the product form
  createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(1000)],
      categoryId: ['', Validators.required],
      variants: this.fb.array([this.createVariantFormGroup()]),
      imageUrl: [''] // Hidden field to store the image URL
    });
  }

  // Create a form group for a product variant
  createVariantFormGroup(): FormGroup {
    return this.fb.group({
      id: [null], // For existing variants
      price: [0, [Validators.required, Validators.min(0)]],
      salePrice: [null, Validators.min(0)],
      quantity: [0, [Validators.required, Validators.min(0)]],
      type: [''],
      size: [''],
      color: ['']
    });
  }

  // Get the variants form array from the product form
  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  // Add a new variant form group to the variants form array
  addVariant(): void {
    this.variants.push(this.createVariantFormGroup());
  }

  // Remove a variant form group from the variants form array
  removeVariant(index: number): void {
    if (this.variants.length > 1) {
      this.variants.removeAt(index);
    }
  }

  // Load products from the backend
  loadProducts(): void {
    if (!this.storeId) return;
    
    this.isLoading = true;
    
    // Use the ItemService to fetch products by store
    this.itemService.getItemsByStore(this.storeId).subscribe({
      next: (items) => {
        // Process the products data
        this.products = items.map(item => this.mapItemToProduct(item));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  // Map API response to our Product interface
  private mapItemToProduct(item: any): Product {
    return {
      listId: item.id,
      name: item.Name,
      description: item.Description || '',
      categoryId: item.CategoryIds?.[0] || 0,
      storeId: this.storeId!,
      imageUrl: item.ImageUrl || '',
      variants: [{
        id: item.Id,
        price: item.OriginalPrice,
        salePrice: item.SalePrice,
        quantity: item.QuantityInStock,
        // Placeholder for variant specifics that might not be in the Item model
        type: '',
        size: '',
        color: ''
      }]
    };
  }

  // Load categories from the backend
  loadCategories(): void {
    if (!this.storeId) return;
    
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories.filter(c => c.storeId === this.storeId);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  // Edit an existing product
  editProduct(product: Product): void {
    this.isEditMode = true;
    this.currentProductId = product.listId || null;
    this.imagePreview = product.imageUrl || null;
    
    // Clear existing variants
    while (this.variants.length) {
      this.variants.removeAt(0);
    }
    
    // Add form groups for each variant
    product.variants.forEach(variant => {
      this.variants.push(this.fb.group({
        id: [variant.id],
        price: [variant.price, [Validators.required, Validators.min(0)]],
        salePrice: [variant.salePrice, Validators.min(0)],
        quantity: [variant.quantity, [Validators.required, Validators.min(0)]],
        type: [variant.type || ''],
        size: [variant.size || ''],
        color: [variant.color || '']
      }));
    });
    
    // Set form values for the product
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || ''
    });
  }

  // Cancel editing or adding a product
  cancelEdit(): void {
    this.isEditMode = false;
    this.currentProductId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.productForm.reset();
    
    // Reset to single variant
    while (this.variants.length) {
      this.variants.removeAt(0);
    }
    this.variants.push(this.createVariantFormGroup());
  }

  // Save a product (create new or update existing)
  saveProduct(): void {
    if (this.productForm.invalid || !this.storeId) return;
    
    this.isSaving = true;
    
    const formData = this.productForm.value;
    const baseProductData = {
      name: formData.name,
      description: formData.description,
      categoryId: formData.categoryId,
      variants: formData.variants.map((v: any) => ({
        itemId: v.id || 0, // 0 for new variants
        price: v.price,
        salePrice: v.salePrice || 0, // Default to 0 if undefined
        quantity: v.quantity,
        type: v.type || '',
        size: v.size || '',
        colour: v.color || '',
        images: []
      }))
    };
    
    // If editing, include the product ID and cast to update payload
    if (this.isEditMode && this.currentProductId) {
      const updatePayload: ProductUpdatePayload = {
        ...baseProductData
      };
      
      // Update the product
      this.itemService.updateProduct(this.currentProductId, updatePayload).subscribe({
        next: (result) => {
          // Handle successful update
          console.log('Product updated:', result);
          
          // If there's a new file selected, upload it
          if (this.selectedFile && this.currentProductId) {
            this.uploadProductImage(this.currentProductId);
          } else {
            this.handleSaveComplete();
          }
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.isSaving = false;
          alert('Failed to update product. Please try again.');
        }
      });
    } else {
      // Create a new product
      const createPayload: ProductCreatePayload = {
        ...baseProductData,
        storeId: this.storeId!
      };
      
      this.itemService.createProduct(createPayload).subscribe({
        next: (result) => {
          // Handle successful creation
          console.log('Product created:', result);
          
          // If there's a file selected, upload it
          if (this.selectedFile && result.listId) {
            this.uploadProductImage(result.listId);
          } else {
            this.handleSaveComplete();
          }
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.isSaving = false;
          alert('Failed to create product. Please try again.');
        }
      });
    }
  }
  
  // Handle the completion of the save operation
  private handleSaveComplete(): void {
    this.isSaving = false;
    this.cancelEdit();
    this.loadProducts();
  }

  // Calculate the price range for display
  getPriceRange(product: Product): string {
    if (!product.variants || product.variants.length === 0) {
      return 'N/A';
    }
    
    const prices = product.variants.map(v => v.salePrice !== undefined && v.salePrice < v.price ? v.salePrice : v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }

  // Calculate the total stock for display
  getTotalStock(product: Product): number {
    if (!product.variants || product.variants.length === 0) {
      return 0;
    }
    
    return product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
  }

  // Delete a product
  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading = true;
      
      this.itemService.deleteProduct(productId).subscribe({
        next: () => {
          console.log('Product deleted:', productId);
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.isLoading = false;
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  // Show the add product form
  showAddProductForm(): void {
    this.isEditMode = false;
    this.currentProductId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.productForm.reset();
    
    // Reset to single variant
    while (this.variants.length) {
      this.variants.removeAt(0);
    }
    this.variants.push(this.createVariantFormGroup());
  }
  
  // Handle file selection for product image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.imagePreview = e.target.result;
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  // Upload a product image
  private uploadProductImage(itemId: number): void {
    if (!this.selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const base64String = e.target.result.toString();
        this.itemService.uploadProductImage(base64String).subscribe({
          next: (response) => {
            console.log('Image uploaded:', response);
            this.handleSaveComplete();
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            // Even if image upload fails, we still consider the product save complete
            this.handleSaveComplete();
            alert('Product saved, but image upload failed. You can try uploading the image again by editing the product.');
          }
        });
      }
    };
    reader.readAsDataURL(this.selectedFile);
  }
  
  // Remove the currently selected image
  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.productForm.patchValue({ imageUrl: '' });
  }

  // Method to open file input
  openFileInput(): void {
    const fileInput = document.getElementById('product-image') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Helper method to find category name
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.categoryId === categoryId);
    return category ? category.name : 'Uncategorized';
  }
}
