// app.routes.ts
import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Contact } from './contact/contact';
import { ProfileForm } from './profile-form/profile-form';

export const routes: Routes = [
  { path: '', component: Home },
  // { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile-form', component: ProfileForm },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: '**', redirectTo: '' }
];
