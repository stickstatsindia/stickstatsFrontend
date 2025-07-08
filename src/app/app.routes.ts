import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { ProfileForm } from './profile-form/profile-form';
import { LiveDashboardComponent } from './liveDashboard/live-dashboard/live-dashboard';
import { AddTournamentComponent } from './add-tournament.component/add-tournament.component';
import { PlayerProfileComponent } from './player-profile/player-profile.component';
// import { PlayerProfile } from './player-profile/player-profile.component';
// import { PlayerProfile }
import { TeamManagementComponent } from './team-management/team-management';

export const routes: Routes = [
  { path: '', component: Home },
  // { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile-form', component: ProfileForm },
  { path: 'about', component: About },
  { path: 'player-profile', component: PlayerProfileComponent },
  { path: 'contact', component: Contact },
  { path: 'live-dashboard', component: LiveDashboardComponent },
  { path: 'add-tournament', component: AddTournamentComponent },
  { path: 'tournament-details', component: TeamManagementComponent },
  //Add new path before this
  { path: '**', redirectTo: '' }
  
];
