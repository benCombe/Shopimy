import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  @Input() storeData: StoreDetails | null = null;
  @Input() theme: StoreTheme | null = null;
  @Input() isPreview: boolean = false;

  categoriesToShow: Category[] = [];

  ngOnInit(): void {
    if (this.storeData?.categories) {
      this.categoriesToShow = this.isPreview
        ? this.storeData.categories.slice(0, 3)
        : this.storeData.categories;
    }
  }

  getThemeStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    if (this.theme) {
      styles['--categories-bg'] = this.theme.thirdColor || '#D3CEBB';
      styles['--categories-heading-color'] = this.theme.mainColor || '#393727';
      styles['--categories-underline-color'] = this.theme.secondColor || '#D0933D';
    } else if (this.storeData) {
      styles['--categories-bg'] = this.storeData.theme_3;
      styles['--categories-heading-color'] = this.storeData.theme_1;
      styles['--categories-underline-color'] = this.storeData.theme_2;
    }
    return styles;
  }
} 