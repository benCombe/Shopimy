import { Component } from '@angular/core';

@Component({
  selector: 'app-cancel',
  template: `<h2>Payment Cancelled</h2>
             <p>Your payment was not completed. Please try again.</p>`,
  standalone: true
})
export class CancelComponent {}
