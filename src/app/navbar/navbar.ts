import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true, // ✅ Required for Angular standalone components
  imports: [RouterModule], // ✅ Required for routerLink to work
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'] // ❗ was `styleUrl` (wrong), should be `styleUrls`
})
export class Navbar {}
