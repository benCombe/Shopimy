import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private storeService: StoreService
  ) {}

  ngOnInit() {
    // Initialize settings
  }

  saveSettings() {
    // TODO: Implement saving settings
    console.log('Saving Settings...');
  }
}
