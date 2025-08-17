import { Component  } from '@angular/core';
import { RouterLink, RouterLinkWithHref, RouterOutlet } from '@angular/router';
// import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar'; // Only needed component
import {  FormsModule } from '@angular/forms'; // Importing FormsModule for ngModel
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModel } from '@angular/forms';
import { Footer } from "./footer/footer";



@Component({
  selector: 'app-root',
   imports: [RouterOutlet, Navbar, FormsModule, CommonModule, Footer],
  standalone: true,
  // imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'hockey-website';
}
