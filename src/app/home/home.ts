import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { About } from "../about/about";
import { Contact } from "../contact/contact";

@Component({
  selector: 'app-home',
  imports: [About, Contact],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
