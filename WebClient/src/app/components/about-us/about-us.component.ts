import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent {
  // Team members data from README.md
  teamMembers = [
    { name: 'Ben Combe', role: 'Scrum Master', studentId: '5819446', email: 'bc14lk@brocku.ca', github: 'benCombe' },
    { name: 'Ashley Bishop', role: 'Product Owner', studentId: '6693824', email: 'ab18yg@brocku.ca', github: 'ashley-Bishop' },
    { name: 'Adam Shariff', role: 'Dev Team', studentId: '6768600', email: 'as19tq@brocku.ca', github: 'adamshariff' },
    { name: 'Ben DeHooge', role: 'Dev Team', studentId: '6567069', email: 'bd18rc@brocku.ca', github: 'bdehooge' },
    { name: 'Spencer Ing', role: 'Dev Team', studentId: '6756605', email: 'si19wd@brocku.ca', github: 'Spencer-Ing' },
    { name: 'Braden Lucas', role: 'Dev Team', studentId: '6880462', email: 'bl19mj@brocku.ca', github: 'bl19mj' },
    { name: 'Steven Putter', role: 'Dev Team', studentId: '6966048', email: 'sp19cj@brocku.ca', github: 'sp19cj' }
  ];

  // Features from README.md
  features = [
    'Easy Shop Creation & Management: Quickly set up and configure online stores.',
    'Product & Category Organization: Manage digital and physical items within a hierarchical category structure.',
    'Unique Visibility Links: Generate specific URLs for sharing entire shops, single categories, or individual items.',
    'Integrated Payments: Securely process payments using Stripe.',
    'Delivery Management: Collect shipping addresses for physical goods and provide access for digital items.',
    'Ratings & Reviews: Allow customers to rate and review products.',
    'Analytics Dashboard: Track shop performance, sales trends, and buyer behavior.',
    'Store Customization: Personalize shops with logos, color schemes, and banners.',
    'Mobile-Friendly Design: Fully responsive interface for desktops, tablets, and mobile devices.',
    'Secure Authentication: JWT-based user registration, login, and profile management.'
  ];
} 