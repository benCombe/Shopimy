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
  styles: [`
    .themes-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
      font-family: var(--main-font-fam);
    }
    
    .themes-header {
      margin-bottom: 24px;
    }
    
    .themes-header h2 {
      font-size: 1.75rem;
      color: var(--main-color);
      margin: 0 0 6px 0;
      font-family: var(--main-font-fam);
    }
    
    .description {
      color: var(--main-color);
      font-size: 0.95rem;
      opacity: 0.8;
    }
    
    .theme-editor {
      background-color: transparent;
      border-radius: 0;
      box-shadow: none;
      overflow: visible;
    }
    
    .theme-form {
      padding: 0;
    }
    
    .editor-content {
      display: flex;
      gap: 32px;
      overflow: hidden;
    }
    
    .control-panel {
      width: 35%;
      min-width: 360px;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .preview-panel {
      flex: 1;
      min-width: 0;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 600px;
    }
    
    .preview-panel h3 {
      font-size: 1.1rem;
      color: var(--main-color);
      margin: 0 0 12px 0;
      padding: 16px 16px 0 16px;
    }
    
    .preview-frame-wrapper {
      flex: 1;
      background-color: var(--third-color);
      border-radius: 0 0 8px 8px;
      overflow: hidden;
      position: relative;
      min-height: 500px;
    }
    
    .color-section,
    .font-section {
      margin-bottom: 0;
      background-color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    
    h3 {
      font-size: 1.1rem;
      color: var(--main-color);
      margin: 0 0 12px 0;
      font-family: var(--main-font-fam);
    }
    
    .color-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 20px;
    }
    
    .color-input {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
    
    .color-input label {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--main-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .color-input input[type="color"] {
      width: 100%;
      height: 36px;
      padding: 2px;
      border: 2px solid var(--third-color);
      border-radius: 6px;
      cursor: pointer;
      background-color: white;
    }
    
    .color-value {
      font-family: monospace;
      color: var(--main-color);
      opacity: 0.7;
      font-size: 0.85rem;
      background-color: var(--third-color);
      padding: 4px 8px;
      border-radius: 4px;
      display: block;
      word-break: break-all;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .font-input {
      max-width: 100%;
      padding: 0;
      border-radius: 6px;
    }
    
    .font-input label {
      display: block;
      margin-bottom: 6px;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--main-color);
    }
    
    .font-select {
      width: 100%;
      padding: 8px 10px;
      border: 2px solid var(--third-color);
      border-radius: 6px;
      font-size: 0.95rem;
      color: var(--main-color);
      background-color: white;
      cursor: pointer;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    
    app-store-preview {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 400px;
    }
    
    .actions {
      margin-top: 0;
      display: flex;
      justify-content: flex-end;
      padding: 0;
    }
    
    .save-btn {
      padding: 10px 20px;
      background-color: var(--second-color);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: var(--main-font-fam);
    }
    
    .save-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    @media (min-width: 1440px) {
      .themes-container {
        padding: 32px;
      }
      
      .control-panel {
        gap: 32px;
      }
      
      .color-inputs {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .preview-panel {
        min-height: 700px;
      }
    }
    
    @media (max-width: 768px) {
      .themes-container {
        padding: 16px;
      }
      
      .editor-content {
        flex-direction: column;
      }
      
      .control-panel {
        width: 100%;
        max-width: 100%;
        min-width: auto;
      }
      
      .themes-header h2 {
        font-size: 1.5rem;
      }
      
      .color-inputs {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }
      
      .preview-panel {
        min-height: 400px;
      }
    }
  `]
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
