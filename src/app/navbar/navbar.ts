import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  isLoggedIn: boolean = false;

  onLogin(): void {
    this.isLoggedIn = true;
  }

  onLogout(): void {
    this.isLoggedIn = false;
  }
}
