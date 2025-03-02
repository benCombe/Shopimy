import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { StoreDetails } from '../../../models/store-details';
import { ThemeService } from '../../../services/theme.service';
import { NgFor } from '@angular/common';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-store-nav',
  imports: [NgFor],
  templateUrl: './store-nav.component.html',
  styleUrl: './store-nav.component.css'
})

export class StoreNavComponent implements AfterViewInit, OnInit{


  storeDetails: StoreDetails = new StoreDetails("0000", "default", "DEFAULT", "#000000", "#565656", "#121212", "Cambria, Cochin", "#f6f6f6", "BLANK", "BLANK"); //Use  Store/Theme services here
  tempCategories: string[] = ["Clothing", "Materials", "Other"].reverse();


  constructor(private renderer: Renderer2, private themeService: ThemeService, private storeService: StoreService) {}


  ngOnInit(): void {
    this.storeService.activeStore$.subscribe(s =>{
      this.storeDetails = s;
    })
  }


  ngAfterViewInit(): void {
    this.themeService.setThemeOne("theme1");
    this.themeService.setThemeTwo("theme2");
    this.themeService.setThemeThree("theme3");
    this.themeService.setFontColor("fc");
    this.themeService.setButtonHoverColor("cat")
  }

}
