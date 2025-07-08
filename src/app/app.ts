import { Component } from '@angular/core';
import { RouterLink, RouterLinkWithHref, RouterOutlet } from '@angular/router';
// import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar'; // Only needed component
import {  FormsModule } from '@angular/forms'; // Importing FormsModule for ngModel




@Component({
  selector: 'app-root',
   imports: [RouterOutlet, Navbar,FormsModule],
  standalone: true,
  // imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'hockey-website';
}
