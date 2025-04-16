import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-overview',
  imports: [],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
  @Output() pageNavigate = new EventEmitter<string>();

  navigateTo(page: string): void {
    // Emit the page name to be handled by the parent component
    this.pageNavigate.emit(page);
  }
}
