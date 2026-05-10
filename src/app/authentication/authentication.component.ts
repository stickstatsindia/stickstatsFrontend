import { Component, OnInit, NgZone } from '@angular/core'; // 1. Import NgZone
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';
import { environment } from '../config/api.config';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-phone-auth',
  standalone: true,
  templateUrl: './authentication.component.html'
})
export class AuthenticationComponent implements OnInit {
  isReady = false;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private ngZone: NgZone, // 2. Inject NgZone
    @Inject(DOCUMENT) private document: Document, 
    @Inject(PLATFORM_ID) private platformId: Object, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Check local storage immediately (Synchronous)
    const token = localStorage.getItem('your_token_key'); 

    if (token) {
      // User is already here? Send them away instantly.
      this.router.navigate(['/search-tournaments']);
    } else {
      // 2. No session? Now we show the login UI and load the script.
      this.isReady = true;
      if (isPlatformBrowser(this.platformId)) {
        this.loadPhoneEmailScript();
      }
    }
  }

  loadPhoneEmailScript() {
    const script = this.document.createElement('script');
    script.src = 'https://www.phone.email/sign_in_button_v1.js';
    script.async = true;
    this.document.body.appendChild(script);

    (window as any).phoneEmailListener = (userObj: any) => {
      // 3. Wrap the logic in ngZone.run
      this.ngZone.run(() => {
        const { user_json_url } = userObj;

        this.http.post<any>(`${environment.baseUrl}/auth/phone-email`, { user_json_url })
          .subscribe({
            next: (res) => {
              this.authService.login(res.token, res.user_id, res.phone_number);

              if (res.isNewUser) {
                this.router.navigate(['/profile-form']);
              } else {
                this.router.navigate(['/search-tournaments']);
              }
            },
            error: () => {
              Swal.fire({
                icon: 'error',
                title: 'Authentication Failed',
                text: 'We could not sign you in.',
                confirmButtonColor: '#d33'
              });
            }
          });
      });
    };
  }
}
