import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  ItemService,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductVariantPayload,
  ProductListItem,
  ProductDetail,
  ProductVariant as ProductVariantDetail
} from '../../../services/item.service';
import { CategoryService, Category } from '../../../services/category.service';
import { StoreService } from '../../../services/store.service';
import { Router } from '@angular/router';

// Interface for the variant form group structure (includes local state for file/preview)
interface ProductVariantFormValue {
  itemId?: number;
  price: number;
  salePrice?: number;
  quantity: number;
  type?: string;
  size?: string;
  colour?: string;
  imageUrl?: string;
  imagePreview?: string | ArrayBuffer | null;
  imageFile?: File | null;
}

// Interface for our combined Product model used in the component state
interface ProductDisplayModel {
  listId?: number;
  name: string;
  description: string;
  categoryId: number;
  storeId: number;
  variants: ProductVariantFormValue[];
  availFrom?: Date | null;
  availTo?: Date | null;
  status?: 'Draft' | 'Published' | 'Scheduled' | 'Expired';
}

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.css'
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  products: ProductListItem[] = [];
  categories: Category[] = [];
  isLoading = false;
  isEditMode = false;
  currentListId: number | null = null;
  isSaving = false;
  storeId: number | null = null;
  private currentStoreId: number = 0;

  private subscriptions: Subscription[] = [];

  document = document;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private storeService: StoreService,
    private router: Router
  ) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    const storeSub = this.storeService.activeStore$.subscribe(store => {
      if (store) {
        this.storeId = store.id;
        this.currentStoreId = store.id;
        this.loadProducts();
        this.loadCategories();
      } else {
        this.storeId = null;
        this.products = [];
        this.categories = [];
      }
    });
    this.subscriptions.push(storeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(1000)],
      categoryId: ['', Validators.required],
      availFrom: [null],
      availTo: [null],
      variants: this.fb.array([this.createVariantFormGroup()])
    });
  }

  createVariantFormGroup(variant: Partial<ProductVariantFormValue> = {}): FormGroup {
    return this.fb.group({
      itemId: [variant.itemId || 0],
      price: [variant.price || 0, [Validators.required, Validators.min(0.01)]],
      salePrice: [variant.salePrice || null, Validators.min(0)],
      quantity: [variant.quantity || 0, [Validators.required, Validators.min(0)]],
      type: [variant.type || ''],
      size: [variant.size || ''],
      colour: [variant.colour || ''],
      imageUrl: [variant.imageUrl || ''],
      imagePreview: [variant.imagePreview || null],
      imageFile: [variant.imageFile || null]
    });
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  addVariant(): void {
    this.variants.push(this.createVariantFormGroup());
  }

  removeVariant(index: number): void {
    if (this.variants.length > 1) {
      const variantToRemove = this.variants.at(index);
      const itemIdToRemove = variantToRemove.get('itemId')?.value;
      if (itemIdToRemove > 0) {
        let deletedIds = this.productForm.get('deletedVariantIds')?.value || [];
        deletedIds.push(itemIdToRemove);
        if (!this.productForm.get('deletedVariantIds')) {
          this.productForm.addControl('deletedVariantIds', this.fb.control([]));
        }
        this.productForm.patchValue({ deletedVariantIds: deletedIds });
      }
      this.variants.removeAt(index);
    } else {
      alert("A product must have at least one variant.");
    }
  }

  loadProducts(): void {
    if (!this.storeId) return;
    
    this.isLoading = true;
    const productSub = this.itemService.getItemsByStore(this.storeId).subscribe({
      next: (items: ProductListItem[]) => {
        // Use a type assertion to tell TypeScript that we're handling the status correctly
        this.products = items.map(item => ({
          ...item,
          status: this.getProductStatus(item.availFrom, item.availTo)
        })) as unknown as ProductListItem[];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(productSub);
  }

  getProductStatus(availFrom?: Date | string | null, availTo?: Date | string | null): 'Draft' | 'Published' | 'Scheduled' | 'Expired' {
    const now = new Date();
    const fromDate = availFrom ? new Date(availFrom) : null;
    const toDate = availTo ? new Date(availTo) : null;

    if (!fromDate) {
      return 'Draft';
    }
    
    // Check if product is expired (availTo date is in the past)
    if (toDate && toDate < now) {
      return 'Expired';
    }
    
    // Else check if scheduled or published
    return fromDate > now ? 'Scheduled' : 'Published';
  }

  loadCategories(): void {
    if (!this.storeId) return;
    const categorySub = this.categoryService.getCategories(this.currentStoreId).subscribe({
      next: (categories: Category[]) => {
        this.categories = categories.filter(c => c.storeId === this.storeId);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
    this.subscriptions.push(categorySub);
  }

  editProduct(productListItem: ProductListItem): void {
    if (!productListItem.listId) return;

    this.isLoading = true;
    this.itemService.getProductDetails(productListItem.listId).subscribe({
      next: (productDetail: ProductDetail) => {
        this.isEditMode = true;
        this.currentListId = productDetail.listId;

        this.productForm.reset();
        this.variants.clear();

        this.productForm.patchValue({
          name: productDetail.name,
          description: productDetail.description,
          categoryId: productDetail.categoryId,
          availFrom: productDetail.availFrom ? new Date(productDetail.availFrom).toISOString().split('T')[0] : null,
          availTo: productDetail.availTo ? new Date(productDetail.availTo).toISOString().split('T')[0] : null,
        });

        if (!this.productForm.get('deletedVariantIds')) {
          this.productForm.addControl('deletedVariantIds', this.fb.control([]));
        } else {
          this.productForm.get('deletedVariantIds')?.reset([]);
        }

        productDetail.variants.forEach(variant => {
          this.variants.push(this.createVariantFormGroup({
            itemId: variant.itemId,
            price: variant.price,
            salePrice: variant.salePrice,
            quantity: variant.quantity,
            type: variant.type,
            size: variant.size,
            colour: variant.colour,
            imageUrl: variant.images?.[0] || '',
            imagePreview: variant.images?.[0] || null
          }));
        });

        this.isLoading = false;
        window.scrollTo(0, 0);
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
        this.isLoading = false;
        alert('Failed to load product details. Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.currentListId = null;
    this.productForm.reset();
    this.variants.clear();
    this.variants.push(this.createVariantFormGroup());
    if (this.productForm.get('deletedVariantIds')) {
      this.productForm.removeControl('deletedVariantIds');
    }
  }

  saveProduct(publish: boolean = false): void {
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid || !this.storeId) {
      console.warn("Form is invalid or Store ID missing.");
      return;
    }

    this.isSaving = true;
    const formData = this.productForm.getRawValue();

    const variantPayloads: ProductVariantPayload[] = formData.variants.map((v: ProductVariantFormValue) => ({
      itemId: v.itemId || 0,
      price: v.price,
      salePrice: v.salePrice ?? 0,
      quantity: v.quantity,
      type: v.type || '',
      size: v.size || '',
      colour: v.colour || '',
      images: v.imageUrl ? [v.imageUrl] : []
    }));

    const availFromDate = publish ? new Date() : null;
    const availToDate = formData.availTo ? new Date(formData.availTo) : null;

    if (this.isEditMode && this.currentListId) {
      const updatePayload: ProductUpdatePayload = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        availFrom: availFromDate,
        availTo: availToDate,
        variants: variantPayloads,
        deletedVariantIds: formData.deletedVariantIds || []
      };

      const updateSub = this.itemService.updateProduct(this.currentListId, updatePayload).subscribe({
        next: (result) => {
          console.log('Product updated:', result);
          this.handleSaveSuccess();
        },
        error: (error) => this.handleSaveError(error, 'update')
      });
      this.subscriptions.push(updateSub);
    } else {
      const createPayload: ProductCreatePayload = {
        storeId: this.storeId!,
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        availFrom: availFromDate,
        availTo: availToDate,
        variants: variantPayloads
      };

      const createSub = this.itemService.createProduct(createPayload).subscribe({
        next: (result) => {
          console.log('Product created:', result);
          this.handleSaveSuccess();
        },
        error: (error) => this.handleSaveError(error, 'create')
      });
      this.subscriptions.push(createSub);
    }
  }

  private handleSaveSuccess(): void {
    this.isSaving = false;
    const message = `Product ${this.isEditMode ? 'updated' : 'saved'} successfully!`;
    console.log(message);
    this.cancelEdit();
    this.loadProducts();
  }

  private handleSaveError(error: any, action: 'create' | 'update'): void {
    console.error(`Error ${action} product:`, error);
    this.isSaving = false;
    const message = error?.error?.message || `Failed to ${action} product. Please try again.`;
    console.error(message);
    // TODO: Replace with proper notification service when available
  }

  deleteProduct(listId: number): void {
    if (!listId) return;
    if (confirm('Are you sure you want to delete this product and all its variants? This cannot be undone.')) {
      this.isLoading = true;
      const deleteSub = this.itemService.deleteProduct(listId).subscribe({
        next: () => {
          console.log('Product deleted:', listId);
          this.products = this.products.filter(p => p.listId !== listId);
          this.isLoading = false;
          console.log('Product deleted successfully.');
          // TODO: Replace with proper notification service when available
          if (this.isEditMode && this.currentListId === listId) {
            this.cancelEdit();
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.isLoading = false;
          console.error('Failed to delete product. Please try again.');
          // TODO: Replace with proper notification service when available
        }
      });
      this.subscriptions.push(deleteSub);
    }
  }

  showAddProductForm(): void {
    this.cancelEdit();
  }

  onFileSelected(event: Event, variantIndex: number): void {
    const input = event.target as HTMLInputElement;
    const variantFormGroup = this.variants.at(variantIndex) as FormGroup;

    if (input.files && input.files[0] && variantFormGroup) {
      const file = input.files[0];
      variantFormGroup.patchValue({ imageFile: file });

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64String = e.target.result as string;
          variantFormGroup.patchValue({ imagePreview: base64String });
          this.uploadVariantImage(base64String, variantIndex);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private uploadVariantImage(base64String: string, variantIndex: number): void {
    const variantFormGroup = this.variants.at(variantIndex) as FormGroup;
    if (!variantFormGroup) return;

    this.itemService.uploadProductImage(base64String).subscribe({
      next: (response) => {
        console.log(`Image uploaded for variant ${variantIndex}:`, response);
        variantFormGroup.patchValue({
          imageUrl: response.imageUrl,
          imagePreview: response.imageUrl,
          imageFile: null
        });
        variantFormGroup.get('imageUrl')?.markAsDirty();
      },
      error: (error) => {
        console.error(`Error uploading image for variant ${variantIndex}:`, error);
        console.error(`Failed to upload image for variant ${variantIndex + 1}. Please try again.`);
        // TODO: Replace with proper notification service when available
        variantFormGroup.patchValue({
          imagePreview: null,
          imageFile: null
        });
      }
    });
  }

  removeSelectedImage(variantIndex: number): void {
    const variantFormGroup = this.variants.at(variantIndex) as FormGroup;
    if (variantFormGroup) {
      variantFormGroup.patchValue({
        imageFile: null,
        imagePreview: null,
        imageUrl: ''
      });
      variantFormGroup.get('imageUrl')?.markAsDirty();
    }
  }

  openFileInput(variantIndex: number): void {
    const fileInput = this.document.getElementById(`variant-image-${variantIndex}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.categoryId === categoryId);
    return category ? category.name : 'Uncategorized';
  }

  getPriceRange(product: ProductListItem): string {
    if (product.minPrice === product.maxPrice) {
      return `$${product.minPrice.toFixed(2)}`;
    } else {
      return `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`;
    }
  }

  getTotalStock(product: ProductListItem): number {
    return product.totalQuantity;
  }

  navigateToStoreEditor(): void {
    this.router.navigate(['/dashboard'], { queryParams: { page: 'Store Editor' } });
  }
}
