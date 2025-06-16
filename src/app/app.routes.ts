import { Routes } from '@angular/router';
import { LiveDashboardComponent } from './liveDashboard/live-dashboard/live-dashboard';
import { Home } from './home/home';

export const routes: Routes = [

{ path: '', component: Home },
  { path: 'live-dashboard', component: LiveDashboardComponent }
];
