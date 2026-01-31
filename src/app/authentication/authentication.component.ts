import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-phone-auth',
  standalone: true,
  templateUrl: './authentication.component.html'
})
export class AuthenticationComponent implements OnInit {

  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document,  @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPhoneEmailScript();
    }
  }

  loadPhoneEmailScript() {
    const script = this.document.createElement('script');
    script.src = 'https://www.phone.email/sign_in_button_v1.js';
    script.async = true;
    this.document.body.appendChild(script);

    (window as any).phoneEmailListener = (userObj: any) => {
      const { user_json_url } = userObj;

      this.http.post<any>('http://localhost:3000/auth/phone-email', {
        user_json_url
      }).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          alert('Login successful');
        },
        error: () => alert('Authentication failed')
      });
    };
  }
}
