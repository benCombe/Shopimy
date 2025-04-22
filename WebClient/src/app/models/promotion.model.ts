export interface Promotion {
    promotionId: number;
    storeId: number;
    code: string;
    description?: string;
    discountType: string; // 'Percentage' or 'FixedAmount'
    discountValue: number;
    startDate: string; // ISO date string
    endDate?: string; // ISO date string
    isActive: boolean;
    usageLimit?: number;
}

export enum DiscountType {
    Percentage = 'Percentage',
    FixedAmount = 'FixedAmount'
}

export interface CreatePromotionRequest {
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    usageLimit?: number;
} 