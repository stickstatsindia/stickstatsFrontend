import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  tabs = ['All Games', 'Basketball', 'Football', 'Volleyball'];
  activeTab = 'All Games';
  constructor(private router: Router) {}

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
    this.router.navigate(['/profile-form']);
  }

}


// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { About } from "../about/about";
// import { Contact } from "../contact/contact";
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-home',
//   imports: [About, Contact],
//   templateUrl: './home.html',
//   styleUrl: './home.css'
// })
// export class Home {

//   constructor(private router: Router) {}

//   goToRegister() {
//     this.router.navigate(['/profile-form']);
//   }

// }


