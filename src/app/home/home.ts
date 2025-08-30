import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { About } from "../about/about";
import { Contact } from "../contact/contact";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [About, Contact],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  constructor(private router: Router) {}

  goToRegister() {
    this.router.navigate(['/profile-form']);
  }

}
