import { Component } from '@angular/core';
import { RouterLink, RouterLinkWithHref, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
   imports: [RouterOutlet, RouterLink, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'hockey-website';
}
