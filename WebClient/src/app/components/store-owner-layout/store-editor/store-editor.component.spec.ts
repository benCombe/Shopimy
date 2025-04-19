import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StoreEditorComponent } from './store-editor.component';
import { StoreService } from '../../../services/store.service';
import { UserService } from '../../../services/user.service';
import { LoadingService } from '../../../services/loading.service';
import { StoreDetails } from '../../../models/store-details';
import { StoreTheme } from '../../../models/store-theme.model';
import { ComponentVisibility, DEFAULT_VISIBILITY } from '../../../models/component-visibility.model';
import { CommonModule } from '@angular/common';
import { ThemesComponent } from '../themes/themes.component';

describe('StoreEditorComponent', () => {
  let component: StoreEditorComponent;
  let fixture: ComponentFixture<StoreEditorComponent>;
  let storeServiceMock: any;
  let userServiceMock: any;
  let loadingServiceMock: any;
  let routerMock: any;

  const mockStore = new StoreDetails(
    1, 
    'test-store', 
    'Test Store', 
    '#000000', 
    '#ffffff', 
    '#f0f0f0', 
    '#333333', 
    'sans-serif', 
    'Welcome', 
    'Store', 
    '', 
    '', 
    [],
    DEFAULT_VISIBILITY
  );

  beforeEach(async () => {
    // Mock services
    storeServiceMock = {
      getCurrentUserStore: jasmine.createSpy('getCurrentUserStore').and.returnValue(of(mockStore)),
      activeStore$: of(mockStore),
      createStore: jasmine.createSpy('createStore').and.returnValue(of(mockStore)),
      updateStore: jasmine.createSpy('updateStore').and.returnValue(of(mockStore))
    };

    userServiceMock = {
      activeUser$: of({ id: 1, name: 'Test User' })
    };

    loadingServiceMock = {
      setIsLoading: jasmine.createSpy('setIsLoading')
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        StoreEditorComponent
      ],
      providers: [
        { provide: StoreService, useValue: storeServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StoreEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load store details on init', () => {
    expect(storeServiceMock.getCurrentUserStore).toHaveBeenCalled();
    expect(component.store).toBe(mockStore);
    expect(component.isInitialSetup).toBeFalse();
  });

  it('should initialize with fallback store when no store exists', () => {
    // Setup
    storeServiceMock.getCurrentUserStore.and.returnValue(of(new StoreDetails(0, '', '', '', '', '', '', '', '', '', '', '', [])));
    
    // Re-create component
    fixture = TestBed.createComponent(StoreEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    // Assert
    expect(component.isInitialSetup).toBeTrue();
  });

  it('should update component visibility when toggling components', () => {
    // Find a component to toggle
    const component1 = component.availableComponents.find(c => c.id === 'header');
    if (component1) {
      const initialState = component1.isSelected;
      
      // Toggle the component
      component.toggleComponent(component1);
      
      // Check that it was toggled
      expect(component1.isSelected).toBe(!initialState);
      
      // Check that visibility was updated in the store
      expect(component.store?.componentVisibility.header).toBe(!initialState);
    }
  });

  it('should update theme when new theme is selected', () => {
    // Setup a new theme
    const newTheme: StoreTheme = {
      mainColor: '#ff0000',
      secondColor: '#00ff00',
      thirdColor: '#0000ff',
      altColor: '#ffffff',
      mainFontFam: 'serif'
    };
    
    // Update theme
    component.updateTheme(newTheme);
    
    // Check that store was updated
    expect(component.store?.theme_1).toBe('#ff0000');
    expect(component.store?.theme_2).toBe('#00ff00');
    expect(component.store?.theme_3).toBe('#0000ff');
    expect(component.store?.fontColor).toBe('#ffffff');
    expect(component.store?.fontFamily).toBe('serif');
  });

  it('should validate form correctly', () => {
    // Setup invalid store
    component.store = new StoreDetails(
      0, 
      '', // Empty URL
      '', // Empty name
      '#000000', 
      '#ffffff', 
      '#f0f0f0', 
      '#333333', 
      'sans-serif', 
      'Welcome', 
      'Store', 
      '', 
      '', 
      [],
      DEFAULT_VISIBILITY
    );
    
    // Validate
    const isValid = component.validateForm();
    
    // Should be invalid
    expect(isValid).toBeFalse();
    expect(component.formErrors['name']).toBeTruthy();
    expect(component.formErrors['url']).toBeTruthy();
    
    // Fix the issues
    component.store.name = 'Test Store';
    component.store.url = 'test-store';
    
    // Validate again
    const isValidNow = component.validateForm();
    
    // Should be valid now
    expect(isValidNow).toBeTrue();
    expect(component.formErrors['name']).toBeFalsy();
    expect(component.formErrors['url']).toBeFalsy();
  });

  it('should create a new store when in initial setup mode', () => {
    // Setup component in initial setup mode
    component.isInitialSetup = true;
    component.store = new StoreDetails(
      0, 
      'test-store', 
      'Test Store', 
      '#000000', 
      '#ffffff', 
      '#f0f0f0', 
      '#333333', 
      'sans-serif', 
      'Welcome', 
      'Store', 
      '', 
      '', 
      [],
      DEFAULT_VISIBILITY
    );
    
    // Call save changes
    component.saveChanges();
    
    // Should call createStore
    expect(storeServiceMock.createStore).toHaveBeenCalledWith(component.store);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard'], { queryParams: { page: 'Products' } });
  });

  it('should update an existing store when not in initial setup mode', () => {
    // Setup component not in initial setup mode
    component.isInitialSetup = false;
    component.store = mockStore;
    
    // Call save changes
    component.saveChanges();
    
    // Should call updateStore
    expect(storeServiceMock.updateStore).toHaveBeenCalledWith(mockStore);
  });

  it('should handle URL already exists error on create/update', () => {
    // Setup component in initial setup mode
    component.isInitialSetup = true;
    component.store = new StoreDetails(
      0, 
      'test-store', 
      'Test Store', 
      '#000000', 
      '#ffffff', 
      '#f0f0f0', 
      '#333333', 
      'sans-serif', 
      'Welcome', 
      'Store', 
      '', 
      '', 
      [],
      DEFAULT_VISIBILITY
    );
    
    // Mock error response
    storeServiceMock.createStore.and.returnValue(throwError(() => new Error('URL already exists')));
    
    // Call save changes
    component.saveChanges();
    
    // Should show error
    expect(component.formErrors['url']).toBeTruthy();
    expect(component.activeTab).toBe('basic');
  });
}); 