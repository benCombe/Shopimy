import { NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { StoreNavComponent } from "../store-nav/store-nav.component";
import { ThemeService } from '../../../services/theme.service';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-store-page',
  imports: [NgFor, NgIf, StoreNavComponent],
  templateUrl: './store-page.component.html',
  styleUrl: './store-page.component.css'
})

export class StorePageComponent implements AfterViewInit {


  constructor(private themeService: ThemeService, private storeService: StoreService){}


  ngAfterViewInit(): void {
    this.themeService.setThemeOne("theme1");
    this.themeService.setThemeTwo("theme2");
    this.themeService.setThemeThree("theme3");
    this.themeService.setFontColor("fc");
    this.themeService.setButtonHoverColor("hover")
  }


  //TEMPORARY
  arrayRange(n: number): number[] {
    return Array(n).fill(0).map((_, i) => i);
  }



}
