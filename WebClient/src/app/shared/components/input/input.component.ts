import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, ReactiveFormsModule } from '@angular/forms';

export type InputVariant = 'default' | 'outlined' | 'filled';
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-container" [ngClass]="variant">
      <label *ngIf="label" [for]="id" class="label">
        {{ label }}
        <span *ngIf="required" class="required">*</span>
      </label>
      
      <div class="input-wrapper" [class.focused]="focused" [class.error]="error">
        <input
          [type]="type"
          [id]="id"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [required]="required"
          [attr.aria-invalid]="!!error"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />
        <div *ngIf="icon" class="icon">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      
      <div *ngIf="error" class="error-message">{{ error }}</div>
      <div *ngIf="hint && !error" class="hint">{{ hint }}</div>
    </div>
  `,
  styles: [`
    .input-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      width: 100%;
    }
    
    .label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 0.25rem;
    }
    
    .required {
      color: var(--error);
      margin-left: 0.25rem;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    input {
      width: 100%;
      padding: 0.625rem 0.75rem;
      font-size: 1rem;
      border-radius: 4px;
      border: none;
      outline: none;
      background: transparent;
    }
    
    input:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .icon {
      position: absolute;
      right: 0.75rem;
    }
    
    .error-message {
      font-size: 0.75rem;
      color: var(--error);
      margin-top: 0.25rem;
    }
    
    .hint {
      font-size: 0.75rem;
      color: var(--text-light);
      margin-top: 0.25rem;
    }
    
    /* Variants */
    .default .input-wrapper {
      border: 1px solid var(--border);
      background-color: var(--background);
    }
    
    .default .input-wrapper.focused {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary-light);
    }
    
    .default .input-wrapper.error {
      border-color: var(--error);
    }
    
    .outlined .input-wrapper {
      border: 2px solid var(--border);
      background-color: transparent;
    }
    
    .outlined .input-wrapper.focused {
      border-color: var(--primary);
    }
    
    .outlined .input-wrapper.error {
      border-color: var(--error);
    }
    
    .filled .input-wrapper {
      border: none;
      background-color: var(--secondary-light);
    }
    
    .filled .input-wrapper.focused {
      background-color: var(--secondary);
      box-shadow: 0 0 0 2px var(--primary-light);
    }
    
    .filled .input-wrapper.error {
      box-shadow: 0 0 0 2px var(--error-light);
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() variant: InputVariant = 'default';
  @Input() required = false;
  @Input() disabled = false;
  @Input() error = '';
  @Input() hint = '';
  @Input() icon = false;

  focused = false;
  value = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.focused = true;
  }
} 