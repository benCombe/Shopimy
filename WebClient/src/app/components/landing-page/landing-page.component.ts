import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {

  topImageUrl = "resources/images/woman-typing.jpg";
  midImageUrl = "resources/images/workgroup.jpg"
  bottomImageUrl = "resources/images/mancheckwatch.jpg"

}
