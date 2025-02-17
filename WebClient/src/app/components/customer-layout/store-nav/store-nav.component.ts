import { AfterViewInit, Component, ElementRef, Renderer2 } from '@angular/core';
import { Store } from '../../../models/store';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-store-nav',
  imports: [],
  templateUrl: './store-nav.component.html',
  styleUrl: './store-nav.component.css'
})

export class StoreNavComponent implements AfterViewInit {


  storeDetails: Store = new Store("KnittingNut", "#bf5e16", "#cdb444", "#caeaeb", "Cambria, Cochin", "#f6f6f6"); //Use  Store/Theme services here

  constructor(private renderer: Renderer2, private themeService: ThemeService) {}


  ngAfterViewInit(): void {
    this.themeService.setThemeOne("theme1");
    this.themeService.setThemeTwo("theme2");
    this.themeService.setThemeThree("theme3");
    this.themeService.setFontColor("fc");
  }

}
