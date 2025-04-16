import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StoreService } from '../../../services/store.service';
import { ThemeService } from '../../../services/theme.service';
import { StoreTheme } from '../../../models/store-theme.model';
import { FormsModule } from '@angular/forms';
import { StorePreviewComponent } from '../../shared/store-preview/store-preview.component';

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [
    NgFor, 
    FormsModule, 
    StorePreviewComponent
  ],
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.css'
})
export class ThemesComponent implements OnInit {
  availableFonts: string[] = [
    '"Inria Serif", serif',
    '"Roboto", sans-serif',
    '"Open Sans", sans-serif',
    '"Lato", sans-serif'
  ];

  theme: StoreTheme = {
    mainColor: '#393727',
    secondColor: '#D0933D',
    thirdColor: '#D3CEBB',
    altColor: '#d5d5d5',
    mainFontFam: '"Inria Serif", serif'
  };

  constructor(
    private themeService: ThemeService,
    private storeService: StoreService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // Load current theme settings
    this.loadCurrentTheme();
  }

  loadCurrentTheme() {
    // TODO: Implement loading current theme from StoreService
    this.storeService.activeStore$.subscribe(store => {
      this.theme = {
        mainColor: store.theme_1,
        secondColor: store.theme_2,
        thirdColor: store.theme_3,
        altColor: store.fontColor,
        mainFontFam: store.fontFamily
      };
    });
  }

  saveTheme(): void {
    // Apply the theme to the store container
    this.themeService.applyThemeToContainer(this.theme, '.store-container');
    // TODO: Save theme to backend via StoreService
  }
}
