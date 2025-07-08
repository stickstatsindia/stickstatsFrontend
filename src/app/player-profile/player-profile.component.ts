
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Needed for *ngFor, *ngIf
 
@Component({
  selector: 'app-player-profile',
  standalone: true, // ✅ very important
  imports: [CommonModule], // ✅ include CommonModule here
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent {
  profile = {
    name: 'evejeet singh',
    location: 'Baramulla',
    views: 7,
    isPro: true,
    battingStyle: 'Right Hand',
    imageUrl: 'https://via.placeholder.com/100x100.png?text=Profile',
    matches: 1,
    runs: 0,
    wickets: 0
  };
 
  menu = ['MATCHES', 'STATS', 'AWARDS', 'BADGES', 'TEAMS', 'PHOTOS', 'CONNECTIONS', 'PROFILE'];
}
 