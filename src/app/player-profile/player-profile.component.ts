


import { Component } from '@angular/core';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css']
})
export class PlayerProfileComponent {
  player = {
    name: 'evejeet singh',
    location: 'Baramulla',
    views: 7,
    role: 'RHB',
    stats: {
      matches: 1,
      runs: 0,
      wickets: 0
    }
  };

  //tabs = ['MATCHES', 'STATS', 'AWARDS', 'BADGES', 'TEAMS', 'PHOTOS', 'CONNECTIONS', 'PROFILE'];
  tabs: string[] = [
  'MATCHES', 'STATS', 'AWARDS', 'BADGES',
  'TEAMS', 'PHOTOS', 'CONNECTIONS', 'PROFILE'
];
  selectedTab = 'MATCHES';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}