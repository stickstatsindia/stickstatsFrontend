import { Component } from '@angular/core';
import { RouterLink, RouterLinkWithHref, RouterOutlet } from '@angular/router';
// import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar'; // Only needed component
import { Router } from '@angular/router';




@Component({
  selector: 'app-root',
   imports: [RouterOutlet, RouterLink, RouterLinkWithHref, Navbar],
  standalone: true,
  // imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'hockey-website';
}
