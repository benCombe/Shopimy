import { Component, Input } from '@angular/core';
import { User } from '../../../models/user';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [NgFor, NgIf],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  @Input() user: User | null | undefined;
}
