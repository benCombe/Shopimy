import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-two',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-two.component.html',
  styleUrl: './loading-two.component.css'
})
export class LoadingTwoComponent {
  @Input() fullscreen = false;
  @Input() showText = true;
  @Input() loadingText = 'Loading...';
}
