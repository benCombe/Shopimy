import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Promotion, DiscountType } from '../../../models/promotion.model';
import { PromotionsService } from '../../../services/promotions.service';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.css'
})
export class PromotionsComponent implements OnInit {
  promotions: Promotion[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Form model
  showForm = false;
  isEditMode = false;
  formPromotion: Partial<Promotion> = this.getEmptyPromotion();
  discountTypes = Object.values(DiscountType);
  
  // Confirmation dialog
  showDeleteConfirm = false;
  promotionToDelete: number | null = null;

  constructor(
    private promotionsService: PromotionsService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.isLoading = true;
    this.loadingService.setIsLoading(true);
    this.errorMessage = '';
    
    this.promotionsService.getPromotions().subscribe({
      next: (data) => {
        this.promotions = data;
        this.isLoading = false;
        this.loadingService.setIsLoading(false);
      },
      error: (error) => {
        console.error('Error loading promotions', error);
        this.errorMessage = 'Failed to load promotions. Please try again.';
        this.isLoading = false;
        this.loadingService.setIsLoading(false);
      }
    });
  }

  openAddForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.formPromotion = this.getEmptyPromotion();
  }

  openEditForm(promotion: Promotion): void {
    this.showForm = true;
    this.isEditMode = true;
    // Clone the promotion to avoid direct references
    this.formPromotion = { ...promotion };
  }

  closeForm(): void {
    this.showForm = false;
    // Clear any messages when form closes
    this.errorMessage = '';
    this.successMessage = '';
  }

  savePromotion(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;
    this.loadingService.setIsLoading(true);

    // Simple validation
    if (!this.formPromotion.code || !this.formPromotion.discountType || !this.formPromotion.discountValue) {
      this.errorMessage = 'Please fill in all required fields.';
      this.isLoading = false;
      this.loadingService.setIsLoading(false);
      return;
    }

    if (this.isEditMode && this.formPromotion.promotionId) {
      // Update existing promotion
      this.promotionsService.updatePromotion(this.formPromotion.promotionId, this.formPromotion as Promotion).subscribe({
        next: () => {
          this.successMessage = 'Promotion updated successfully!';
          this.loadPromotions(); // Refresh the list
          this.isLoading = false;
          this.loadingService.setIsLoading(false);
          setTimeout(() => {
            this.closeForm();
          }, 1500); // Close form after showing success message
        },
        error: (error) => {
          console.error('Error updating promotion', error);
          this.errorMessage = 'Failed to update promotion. Please try again.';
          this.isLoading = false;
          this.loadingService.setIsLoading(false);
        }
      });
    } else {
      // Create new promotion
      this.promotionsService.createPromotion(this.formPromotion as any).subscribe({
        next: () => {
          this.successMessage = 'Promotion created successfully!';
          this.loadPromotions(); // Refresh the list
          this.isLoading = false;
          this.loadingService.setIsLoading(false);
          setTimeout(() => {
            this.closeForm();
          }, 1500); // Close form after showing success message
        },
        error: (error) => {
          console.error('Error creating promotion', error);
          this.errorMessage = 'Failed to create promotion. Please try again.';
          this.isLoading = false;
          this.loadingService.setIsLoading(false);
        }
      });
    }
  }

  confirmDelete(promotionId: number): void {
    this.promotionToDelete = promotionId;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.promotionToDelete = null;
  }

  deletePromotion(): void {
    if (this.promotionToDelete === null) return;
    
    this.isLoading = true;
    this.loadingService.setIsLoading(true);
    this.errorMessage = '';
    
    this.promotionsService.deletePromotion(this.promotionToDelete).subscribe({
      next: () => {
        this.successMessage = 'Promotion deleted successfully!';
        this.loadPromotions(); // Refresh the list
        this.showDeleteConfirm = false;
        this.promotionToDelete = null;
        this.isLoading = false;
        this.loadingService.setIsLoading(false);
      },
      error: (error) => {
        console.error('Error deleting promotion', error);
        this.errorMessage = 'Failed to delete promotion. Please try again.';
        this.showDeleteConfirm = false;
        this.isLoading = false;
        this.loadingService.setIsLoading(false);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    
    return date.toLocaleDateString(undefined, options);
  }

  private getEmptyPromotion(): Partial<Promotion> {
    const today = new Date();
    return {
      code: '',
      description: '',
      discountType: DiscountType.Percentage,
      discountValue: 0,
      startDate: today.toISOString().split('T')[0],
      endDate: undefined,
      isActive: true,
      usageLimit: undefined
    };
  }
}
