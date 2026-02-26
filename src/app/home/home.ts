import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  tabs = ['All Games', 'Basketball', 'Football', 'Volleyball'];
  activeTab = 'All Games';
  isLoggedIn: boolean = false;
  private authSub?: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.authSub = this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  faqItems = [
    { question: 'How do I create a tournament on STICKSTATS?', expanded: false },
    { question: 'Can I control multiple teams at once?', expanded: false },
    { question: 'What if I need support during my tournament?', expanded: false }
  ];

  teams = [
    { flag: '🇺🇸', name: 'Team USA', points: '85pts' },
    { flag: '🇪🇸', name: 'Spain', points: '82pts' },
    { flag: '🇫🇷', name: 'France', points: '78pts' },
    { flag: '🇦🇺', name: 'Australia', points: '75pts' }
  ];

  stats = [
    { icon: '👥', number: '1,300+', label: 'Members Found' },
    { icon: '📅', number: '2,365', label: 'Event Engaged' },
    { icon: '🏆', number: '150+', label: 'Top Player Organizations' }
  ];

  footerLinks = {
    pages: ['Home', 'Events and Services', 'Gallery'],
    resource: ['Contact Us', 'FAQ', 'Blog'],
    quickLinks: ['Mission', 'Gallery', 'Teams']
  };

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleFaq(index: number) {
    this.faqItems[index].expanded = !this.faqItems[index].expanded;
  }

  goToRegister() {
    this.router.navigate(['/auth']);
  }
}


