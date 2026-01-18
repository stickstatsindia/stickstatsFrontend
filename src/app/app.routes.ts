import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { ProfileForm as AuthenticationComponent } from './profile-form/profile-form';
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
import { GroupListComponent } from './group-list/group-list';
import { TournamentDashboardComponent } from './tournament-dashboard.component/tournament-dashboard.component';
import { ScheduleMatchTeamSelection } from './schedule-match-team-selection/schedule-match-team-selection';
import { Tournaments } from './tournaments/tournaments';
import { Matches } from './matches/matches';
import { AddNewplayerComponent } from './add-newplayer/add-newplayer';
import { ShowTeamsComponent } from './show-teams/show-teams';

import { AddGroupComponent } from './add-group/add-group';
import { TeamMembersComponent } from './team-members/team-members';

import { AuthenticationComponent as Auth } from './authentication/authentication.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'profile-form', component: AuthenticationComponent },
  { path: 'auth', component: Auth },
  { path: 'about', component: About },
  { path: 'player-profile', component: PlayerProfileComponent },
  { path: 'contact', component: Contact },
  { path: 'live-dashboard', component: LiveDashboardComponent },
  { path: 'add-tournament', component: AddTournamentComponent },
  { path: 'tournament-details/:id', component: TeamManagementComponent },
  { path: 'add-new-rounds', component: AddNewRoundsComponent},
  { path: 'scorer/:matchId', component: ScorerComponent },
  { path: 'result/:matchId', component: Result },
  { path: 'addnew-team', component:AddTeamComponent },
  { path: 'rounds-details', component:RoundsDetailsComponent },
  { path: 'point-table', component:PointsTable },
  { path: 'add-group' , component:AddGroupComponent},
  { path: 'group-list' , component: GroupListComponent},
  { path: 'group-manager', component: GroupListComponent },
  { path: 'tournament-dashboard', component: TournamentDashboardComponent},
  { path: 'schedule-match', component: ScheduleMatchTeamSelection },
  { path: 'schedule-match/:tournament_id', component: ScheduleMatchTeamSelection },
  { path: 'tournaments', component: Tournaments },
  { path: 'matches', component: Matches },
  { path: 'addnew-player', component: AddNewplayerComponent},
  { path: 'show-teams', component: ShowTeamsComponent },
  {path: 'team-members', component: TeamMembersComponent},
  { path: 'edit-tournament/:tournament_id', component: AddTournamentComponent},
  //Add new path before this
  { path: '**', redirectTo: '' }
];
