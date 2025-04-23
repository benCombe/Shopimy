import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { StoreService } from '../services/store.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreOwnerGuard implements CanActivate {
  constructor(
    private storeService: StoreService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.storeService.getCurrentUserStore().pipe(
      map(store => {
        // If the store has a valid ID (not 0), then the user is a store owner
        if (store && store.id && store.id > 0) {
          return true;
        }
        console.warn('Access denied: User does not own a store');
        this.router.navigate(['/create-store'], { 
          queryParams: { returnUrl: state.url }
        });
        return false;
      }),
      catchError(error => {
        console.error('Error checking store ownership:', error);
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  }
} 