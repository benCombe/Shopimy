import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../../services/store.service';
import { StoreDetails } from '../../../models/store-details';
import { FormsModule } from '@angular/forms';
import { StoreTheme } from '../../../models/store-theme.model';

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.css'
})
export class ThemesComponent implements OnInit {
  @Input() currentStore: StoreDetails | null = null;
  @Input() inlineMode: boolean = false; // Used when embedded in store editor
  @Output() themeUpdated = new EventEmitter<StoreTheme>();
  
  themeSwatches = [
    {
      name: 'Earthy Tones',
      mainColor: '#393727',
      secondColor: '#D0933D',
      thirdColor: '#D3CEBB',
      altColor: '#333333',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Ocean Blue',
      mainColor: '#23395B',
      secondColor: '#1C77C3',
      thirdColor: '#E5F1F7',
      altColor: '#333333',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Forest Green',
      mainColor: '#2C4238',
      secondColor: '#557C55',
      thirdColor: '#F2F3EC',
      altColor: '#333333',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Minimalist Grey',
      mainColor: '#333333',
      secondColor: '#666666',
      thirdColor: '#F5F5F5',
      altColor: '#FFFFFF',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Vibrant Purple',
      mainColor: '#4B1D5E',
      secondColor: '#E84A5F',
      thirdColor: '#F9F8FC',
      altColor: '#FFFFFF',
      mainFontFam: 'sans-serif'
    },
    {
      name: 'Cozy Cafe',
      mainColor: '#5A412D',
      secondColor: '#BA8554',
      thirdColor: '#F3EEE8',
      altColor: '#333333',
      mainFontFam: 'sans-serif'
    }
  ];

  customTheme = {
    name: 'Custom Theme',
    mainColor: '#393727',
    secondColor: '#D0933D',
    thirdColor: '#D3CEBB',
    altColor: '#333333',
    mainFontFam: 'sans-serif'
  };

  selectedTheme = 'Earthy Tones';
  activeTab = 'select-theme';

  // Add storeData property to store the active store details
  storeData: StoreDetails | null = null;

  constructor(
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    if (this.currentStore) {
      // Update custom theme from current store values
      this.customTheme.mainColor = this.currentStore.theme_1;
      this.customTheme.secondColor = this.currentStore.theme_2;
      this.customTheme.thirdColor = this.currentStore.theme_3;
      this.customTheme.altColor = this.currentStore.fontColor;
      this.customTheme.mainFontFam = this.currentStore.fontFamily;
      
      // Try to match current theme with a preset
      this.findMatchingTheme();
    } else {
      // Fetch current active store if not provided
      this.storeService.activeStore$.subscribe(store => {
        if (store) {
          this.currentStore = store;
          this.customTheme.mainColor = store.theme_1;
          this.customTheme.secondColor = store.theme_2;
          this.customTheme.thirdColor = store.theme_3;
          this.customTheme.altColor = store.fontColor;
          this.customTheme.mainFontFam = store.fontFamily;
          
          this.findMatchingTheme();
        }
      });
    }
  }

  findMatchingTheme() {
    // Try to match current theme with a preset
    const matchingTheme = this.themeSwatches.find(theme => 
      theme.mainColor === this.currentStore?.theme_1 &&
      theme.secondColor === this.currentStore?.theme_2 &&
      theme.thirdColor === this.currentStore?.theme_3
    );
    
    if (matchingTheme) {
      this.selectedTheme = matchingTheme.name;
    } else {
      this.selectedTheme = 'Custom Theme';
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  selectTheme(theme: any) {
    this.selectedTheme = theme.name;
    
    if (theme.name === 'Custom Theme') {
      // Just use the current custom theme
    } else {
      // Copy colors from theme to custom theme
      this.customTheme.mainColor = theme.mainColor;
      this.customTheme.secondColor = theme.secondColor;
      this.customTheme.thirdColor = theme.thirdColor;
      this.customTheme.altColor = theme.altColor;
      this.customTheme.mainFontFam = theme.mainFontFam;
      
      // If in inline mode, emit theme updated event
      if (this.inlineMode) {
        this.emitThemeUpdate();
      }
    }
  }
  
  updateCustomTheme() {
    this.selectedTheme = 'Custom Theme';
    
    // If in inline mode, emit theme updated event
    if (this.inlineMode) {
      this.emitThemeUpdate();
    }
  }

  emitThemeUpdate() {
    this.themeUpdated.emit({
      mainColor: this.customTheme.mainColor,
      secondColor: this.customTheme.secondColor,
      thirdColor: this.customTheme.thirdColor,
      altColor: this.customTheme.altColor,
      mainFontFam: this.customTheme.mainFontFam
    });
  }
}
