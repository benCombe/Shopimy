import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})

export class PopupComponent {
  @Input() question = 'Are you sure?';
  @Input() responses: string[] = ['Yes', 'No'];
  @Input() isVisible = false;

  @Output() responseSelected = new EventEmitter<string>();

  selectResponse(response: string) {
    this.responseSelected.emit(response);
  }
}
