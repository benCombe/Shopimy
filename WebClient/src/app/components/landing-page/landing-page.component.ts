import { Component } from '@angular/core';
import { TopNavComponent } from "../top-nav/top-nav.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-landing-page',
  imports: [TopNavComponent, FooterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {

  topImageUrl: String = "resources/images/woman-typing.jpg";

}
