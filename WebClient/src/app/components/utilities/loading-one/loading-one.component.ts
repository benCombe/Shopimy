import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-loading-one',
  imports: [NgFor, NgIf],
  templateUrl: './loading-one.component.html',
  styleUrl: './loading-one.component.css'
})
export class LoadingOneComponent implements OnInit {

  isLoading = false;

  icons: string[] = [
    "fa-solid fa-shirt",
    "fa-solid fa-baseball",
    "fa-solid fa-mug-saucer",
    "fa-solid fa-book",
    "fa-solid fa-bicycle",
    "fa-solid fa-paperclip",
    "fa-solid fa-hat-wizard",
    "fa-solid fa-gamepad",
    "fa-solid fa-champagne-glasses",
    "fa-solid fa-binoculars",
    "fa-solid fa-camera",
    "fa-solid fa-car-side",
    "fa-solid fa-puzzle-piece",
    "fa-solid fa-seedling",
    "fa-solid fa-robot",
    "fa-solid fa-glasses",
    "fa-solid fa-chair",
    "fa-solid fa-gift",
    "fa-solid fa-hat-cowboy",
    "fa-solid fa-headphones",
  ]

  constructor(private loadingService: LoadingService){

  }

  ngOnInit(): void {
    this.loadingService.isLoading$.subscribe(b => {
      this.isLoading = b;
    });
  }
}
