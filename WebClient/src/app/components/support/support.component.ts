import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FAQ {
  question: string;
  answer: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  faqs: FAQ[] = [
    {
      question: 'How do I create a store?',
      answer: 'To create a store, log in to your account and click on the "Create Store" option in the navigation menu. Follow the step-by-step instructions to set up your store, including store name, description, and customization options.'
    },
    {
      question: 'How does payment processing work?',
      answer: 'Shopimy integrates with several payment processors. Store owners can configure their preferred payment methods in the store settings. Customers can pay using credit/debit cards, PayPal, or other supported payment options depending on the store configuration.'
    },
    {
      question: 'How do I add products to my store?',
      answer: 'After creating your store, navigate to your dashboard and select "Products" from the left sidebar. Click on "Add New Product" and fill in the product details including name, description, price, and images.'
    },
    {
      question: 'How do I customize my store theme?',
      answer: 'In your store dashboard, navigate to "Settings" > "Theme". Here you can choose from available themes, customize colors, fonts, and layout options to match your brand identity.'
    },
    {
      question: 'How can I track my orders?',
      answer: 'Store owners can view and manage all orders from the "Orders" section in their dashboard. Customers can track their orders through their account or using the order tracking link sent via email after purchase.'
    }
  ];

  toggleFAQ(faq: FAQ): void {
    faq.expanded = !faq.expanded;
  }
} 