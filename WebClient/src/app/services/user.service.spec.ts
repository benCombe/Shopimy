import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { CookieService } from './cookie.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let cookieServiceMock: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    cookieServiceMock = jasmine.createSpyObj('CookieService', ['get', 'set', 'check', 'delete']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: CookieService, useValue: cookieServiceMock }
      ]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load user data on initialization when auth token exists', () => {
    // Arrange
    const mockToken = 'mock-jwt-token';
    const mockUser = {
      Id: 1,
      FirstName: 'Test',
      LastName: 'User',
      Email: 'test@example.com',
      Phone: '123-456-7890',
      Address: '123 Test St',
      Country: 'Test Country',
      Verified: true,
      City: 'Test City',
      State: 'TS',
      PostalCode: '12345',
      DOB: null,
      Subscribed: true
    };
    
    cookieServiceMock.get.and.returnValue(mockToken);
    
    // Act
    service.initializeUserState();
    
    // Assert
    const req = httpMock.expectOne(`${service['apiUrl']}/profile`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    
    req.flush(mockUser);
    
    service.activeUser$.subscribe(user => {
      expect(user.Id).toBe(mockUser.Id);
      expect(user.FirstName).toBe(mockUser.FirstName);
      expect(user.LastName).toBe(mockUser.LastName);
      expect(user.Email).toBe(mockUser.Email);
    });
  });
  
  it('should not attempt to load user data when no auth token exists', () => {
    // Arrange
    cookieServiceMock.get.and.returnValue(null);
    
    // Act
    service.initializeUserState();
    
    // Assert
    httpMock.expectNone(`${service['apiUrl']}/profile`);
    
    service.activeUser$.subscribe(user => {
      expect(user.Id).toBe(0); // Default user
      expect(user.FirstName).toBe('Guest');
    });
  });
});
