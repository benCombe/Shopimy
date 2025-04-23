import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { UserService } from '../../../services/user.service';
import { DeliveryService } from '../../../services/delivery.service';
import { PaymentService } from '../../../services/payment.service';
import { PurchaseService } from '../../../services/purchase.service';
import { User } from '../../../models/user';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let deliveryServiceSpy: jasmine.SpyObj<DeliveryService>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;
  let purchaseServiceSpy: jasmine.SpyObj<PurchaseService>;
  
  // Mock user data
  const mockUser = new User(
    1,
    'Test',
    'User',
    'test@example.com',
    '555-555-5555',
    '123 Test St',
    'Test Country',
    null,
    true,
    'Test City',
    'TS',
    '12345',
    null,
    null,
    null
  );
  
  // Create behavior subject for mock user service
  const userSubject = new BehaviorSubject<User>(mockUser);

  beforeEach(async () => {
    // Create spy objects for services
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUserProfile', 
      'updateUserProfile', 
      'getActiveUser',
      'isLoggedIn',
      'isGuest'
    ], {
      activeUser$: userSubject.asObservable()
    });
    deliveryServiceSpy = jasmine.createSpyObj('DeliveryService', ['getDeliveryAddresses']);
    paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['getStripePublicKey', 'getPaymentMethods']);
    purchaseServiceSpy = jasmine.createSpyObj('PurchaseService', ['getPurchaseHistory']);
    
    // Set default return values
    userServiceSpy.getUserProfile.and.returnValue(of(mockUser));
    userServiceSpy.getActiveUser.and.returnValue(mockUser);
    userServiceSpy.isLoggedIn.and.returnValue(true);
    userServiceSpy.isGuest.and.returnValue(false);
    deliveryServiceSpy.getDeliveryAddresses.and.returnValue(of([]));
    paymentServiceSpy.getStripePublicKey.and.returnValue(of({ publicKey: 'test-key' }));
    paymentServiceSpy.getPaymentMethods.and.returnValue(of([]));
    purchaseServiceSpy.getPurchaseHistory.and.returnValue(of({ purchases: [], total: 0 }));

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule
      ],
      declarations: [ProfileComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: DeliveryService, useValue: deliveryServiceSpy },
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: PurchaseService, useValue: purchaseServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load user data on init', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);
    
    expect(userServiceSpy.getUserProfile).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
    expect(component.isLoadingProfile).toBeFalse();
  }));

  it('should handle API errors gracefully', fakeAsync(() => {
    // Setup error condition
    userServiceSpy.getUserProfile.and.returnValue(throwError(() => new Error('API Error')));
    
    fixture.detectChanges();
    tick(100);
    
    expect(component.profileError).toBeTruthy();
    expect(component.isLoadingProfile).toBeFalse();
  }));

  it('should initialize form with user data', fakeAsync(() => {
    fixture.detectChanges();
    tick(100);
    
    expect(component.profileForm.get('FirstName')?.value).toEqual(mockUser.FirstName);
    expect(component.profileForm.get('LastName')?.value).toEqual(mockUser.LastName);
    expect(component.profileForm.get('Email')?.value).toEqual(mockUser.Email);
  }));

  it('should display guest state when user is not logged in', fakeAsync(() => {
    // Setup guest condition
    userServiceSpy.isLoggedIn.and.returnValue(false);
    userServiceSpy.isGuest.and.returnValue(true);
    userSubject.next(new User(0, 'Guest', 'User', '', '', '', '', null, false, '', '', '', null, null, null));
    
    fixture.detectChanges();
    tick(100);
    
    expect(component.user?.Id).toEqual(0);
  }));
});
