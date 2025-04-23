import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ContactComponent } from './contact.component';
import { TopNavComponent } from '../top-nav/top-nav.component';
import { FooterComponent } from '../footer/footer.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ContactComponent],
      schemas: [NO_ERRORS_SCHEMA] // To ignore child components like TopNavComponent and FooterComponent
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.contactForm.get('name')?.value).toBe('');
    expect(component.contactForm.get('email')?.value).toBe('');
    expect(component.contactForm.get('subject')?.value).toBe('');
    expect(component.contactForm.get('message')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const nameControl = component.contactForm.get('name');
    const emailControl = component.contactForm.get('email');
    const subjectControl = component.contactForm.get('subject');
    const messageControl = component.contactForm.get('message');

    // All fields should be initially invalid because they're required and empty
    expect(nameControl?.valid).toBeFalsy();
    expect(emailControl?.valid).toBeFalsy();
    expect(subjectControl?.valid).toBeFalsy();
    expect(messageControl?.valid).toBeFalsy();

    // Fill in all fields
    nameControl?.setValue('Test User');
    emailControl?.setValue('test@example.com');
    subjectControl?.setValue('Test Subject');
    messageControl?.setValue('Test Message');

    // All fields should now be valid
    expect(nameControl?.valid).toBeTruthy();
    expect(emailControl?.valid).toBeTruthy();
    expect(subjectControl?.valid).toBeTruthy();
    expect(messageControl?.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.contactForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should log form data and reset form on valid submission', () => {
    // Spy on console.log
    spyOn(console, 'log');
    
    // Fill the form with valid data
    component.contactForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test Message'
    });
    
    // Submit the form
    component.onSubmit();
    
    // Verify console.log was called with the form data
    expect(console.log).toHaveBeenCalledWith('Form submitted with data:', {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test Message'
    });
    
    // Verify the form was reset
    expect(component.contactForm.get('name')?.value).toBe(null);
    expect(component.contactForm.get('email')?.value).toBe(null);
    expect(component.contactForm.get('subject')?.value).toBe(null);
    expect(component.contactForm.get('message')?.value).toBe(null);
    expect(component.formSubmitted).toBe(false);
  });
}); 