import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../service/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isMenuOpen: boolean = false;
  private routerSub?: Subscription;
  private authSub?: Subscription;

  constructor(private router: Router, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isMenuOpen = false;
      });

    // Subscribe to auth state changes
    this.authSub = this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      this.cdr.detectChanges();
    });

    // Check initial auth state
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onLogin(): void {
    this.router.navigate(['/auth']);
  }

  onLogout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.closeMenu();
    this.router.navigate(['/']);
  }

  onMyStats(): void {
    const userId = this.authService.getUserId();
    this.closeMenu();
    if (userId) {
      this.router.navigate(['/player-profile', userId]);
      return;
    }
    this.router.navigate(['/profile-form']);
  }
}
