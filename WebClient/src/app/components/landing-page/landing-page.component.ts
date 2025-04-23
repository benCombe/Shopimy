import { Component } from '@angular/core';
import { TopNavComponent } from "../top-nav/top-nav.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [TopNavComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {

  topImageUrl: String = "resources/images/woman-typing.jpg";
  midImageUrl: String = "resources/images/workgroup.jpg"
  bottomImageUrl: String = "resources/images/mancheckwatch.jpg"

}
