import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label 
      class="checkbox-container" 
      [class.disabled]="disabled"
    >
      <div class="checkbox">
        <input
          type="checkbox"
          [id]="id"
          [checked]="checked"
          [disabled]="disabled"
          (change)="onCheckboxChange($event)"
          (blur)="onTouched()"
        />
        <span class="checkmark" [class.checked]="checked" [class.indeterminate]="indeterminate"></span>
      </div>
      <span class="label" *ngIf="label">{{ label }}</span>
    </label>
  `,
  styles: [`
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }
    
    .checkbox-container.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .checkbox {
      position: relative;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
    
    input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      cursor: pointer;
    }
    
    input[type="checkbox"]:disabled {
      cursor: not-allowed;
    }
    
    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      width: 18px;
      height: 18px;
      border: 2px solid var(--border);
      border-radius: 4px;
      background-color: var(--background);
      transition: all 0.2s ease;
    }
    
    .checkmark.checked {
      background-color: var(--primary);
      border-color: var(--primary);
    }
    
    .checkmark.indeterminate {
      background-color: var(--primary);
      border-color: var(--primary);
    }
    
    .checkmark.checked:after {
      content: "";
      position: absolute;
      left: 5px;
      top: 2px;
      width: 5px;
      height: 9px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    
    .checkmark.indeterminate:after {
      content: "";
      position: absolute;
      left: 3px;
      top: 7px;
      width: 10px;
      height: 2px;
      background-color: white;
    }
    
    input[type="checkbox"]:focus + .checkmark {
      box-shadow: 0 0 0 2px var(--primary-light);
    }
    
    .label {
      font-size: 0.875rem;
      color: var(--text);
    }
  `]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() disabled = false;
  @Input() indeterminate = false;

  checked = false;
  
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.disabled) return;
    
    this.checked = target.checked;
    this.onChange(this.checked);
  }
} 