import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { UserService } from './services/user.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['initializeUserState']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AppComponent
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user state on init', () => {
    // Assert that initializeUserState was called exactly once
    expect(userServiceSpy.initializeUserState).toHaveBeenCalledTimes(1);
  });
});
