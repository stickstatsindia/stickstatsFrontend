import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { ProfileForm } from './profile-form/profile-form';
import { LiveDashboardComponent } from './liveDashboard/live-dashboard/live-dashboard';
import { AddTournamentComponent } from './add-tournament.component/add-tournament.component';
import { PlayerProfileComponent } from './player-profile/player-profile.component';
import { TeamManagementComponent } from './team-management/team-management';
import { AddNewRoundsComponent } from './add-new-rounds/add-new-rounds.component';
import { ScorerComponent } from './scorer/scorer.component';
import { Result } from './result/result';
import { AddTeamComponent } from './addnew-team/addnew-team';
import { RoundsDetailsComponent } from './rounds-details/rounds-details';
import { PointsTable } from './points-table/points-table';
import { GroupManagerComponent } from './group-manager/group-manager';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'profile-form', component: ProfileForm },
  { path: 'about', component: About },
  { path: 'player-profile', component: PlayerProfileComponent },
  { path: 'contact', component: Contact },
  { path: 'live-dashboard', component: LiveDashboardComponent },
  { path: 'add-tournament', component: AddTournamentComponent },
  { path: 'tournament-details', component: TeamManagementComponent },
  { path: 'add-new-rounds', component: AddNewRoundsComponent},
  { path: 'scorer', component: ScorerComponent },
  { path: 'result', component: Result },
  { path: 'addnew-team', component:AddTeamComponent },
  { path: 'rounds-details', component:RoundsDetailsComponent },
  { path: 'point-table', component:PointsTable },
  { path: 'group-manager', component: GroupManagerComponent },
  //Add new path before this
  { path: '**', redirectTo: '' }
   
];
