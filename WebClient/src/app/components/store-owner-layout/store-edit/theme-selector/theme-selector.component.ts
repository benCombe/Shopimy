// File: src/app/components/store-owner-layout/store-edit/theme-selector/theme-selector.component.ts
import { Component } from '@angular/core';
import { ThemeService } from '../../../../services/theme.service';
import { StoreTheme } from '../../../../models/store-theme.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrl: './theme-selector.component.scss',
  standalone: true,
  imports: [FormsModule]
})
export class ThemeSelectorComponent {
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
    altColor: '#FFFFFF',
    mainFontFam: '"Inria Serif", serif'
  };

  constructor(private themeService: ThemeService) {}

  saveTheme(): void {
    // Apply the full theme to the store container only
    this.themeService.applyThemeToContainer(this.theme, '.store-container');
    // Optionally, persist theme settings via an API call
  }
}