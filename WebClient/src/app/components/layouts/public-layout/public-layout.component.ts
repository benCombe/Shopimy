import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from '../../top-nav/top-nav.component';
import { ThemeService } from '../../../services/theme.service';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, TopNavComponent, FooterComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent implements OnInit {
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    // Apply base theme for all public pages
    this.themeService.applyBaseTheme();
  }
} 