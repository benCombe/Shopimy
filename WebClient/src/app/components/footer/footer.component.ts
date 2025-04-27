import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { ThemeService } from '../../services/theme.service';
import { StoreDetails } from '../../models/store-details';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear: number;
  storeData: StoreDetails | null = null;
  private destroy$ = new Subject<void>();
  isStoreContext = false;

  constructor(
    private storeService: StoreService,
    private themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.storeService.activeStore$
      .pipe(takeUntil(this.destroy$))
      .subscribe(store => {
        // Only set store data if we have a valid store ID
        if (store && store.id > 0) {
          this.storeData = store;
          this.isStoreContext = true;
        } else {
          this.storeData = null;
          this.isStoreContext = false;
        }
      });
      
    // Subscribe to theme service to know when we're in store context
    this.themeService.inStoreContext$
      .pipe(takeUntil(this.destroy$))
      .subscribe(inStore => {
        this.isStoreContext = inStore;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // The following methods are kept for backward compatibility
  // but they should eventually be removed since we're using CSS variables
  getFooterStyles(): Record<string, string> {
    return {}; // Return empty object as styles are now handled via CSS variables
  }

  getHeadingStyles(): Record<string, string> {
    return {}; // Return empty object as styles are now handled via CSS variables
  }

  getLinkStyles(): Record<string, string> {
    return {}; // Return empty object as styles are now handled via CSS variables
  }
}
