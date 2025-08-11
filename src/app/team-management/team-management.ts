import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-management',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './team-management.html',
  styleUrls: ['./team-management.css']
})
export class TeamManagementComponent {
  team = {
    logoUrl: 'https://example.com/logo.png',
    name: 'The Invincibles',
    startDate: '2025-07-01',
    endDate: '2025-07-10',
    location: 'Mumbai, India',
    viewers: 250000,
    totalMatches: 4 // Example value
  };
}

