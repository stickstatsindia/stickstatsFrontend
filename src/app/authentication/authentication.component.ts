import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPhoneEmailScript();
    }
  }

  loadPhoneEmailScript(): void {
    const script = this.document.createElement('script');
    script.src = 'https://www.phone.email/sign_in_button_v1.js';
    script.async = true;
    this.document.body.appendChild(script);

    (window as any).phoneEmailListener = (userObj: any) => {
      const { user_json_url } = userObj;
      this.authenticatePhoneEmail(user_json_url);
    };
  }

  private authenticatePhoneEmail(user_json_url: string, endpointIndex = 0): void {
    const endpoints = [
      '/proxy/auth/phone-email',
      `${environment.baseUrl}/api/auth/phone-email`,
      `${environment.baseUrl}/auth/phone-email`
    ];

    const endpoint = endpoints[endpointIndex];
    this.http.post<any>(endpoint, { user_json_url }).subscribe({
      next: (res) => {
        this.authService.login(res.token, res.user_id, res.phone_number);
        if (res.isNewUser) {
          this.router.navigate(['/profile-form']);
        } else {
          this.router.navigate(['/search-tournaments']);
        }
      },
      error: (err) => {
        const shouldTryFallback =
          endpointIndex < endpoints.length - 1 && (err?.status === 0 || err?.status === 404);

        if (shouldTryFallback) {
          this.authenticatePhoneEmail(user_json_url, endpointIndex + 1);
          return;
        }

        console.error('Authentication API error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: 'Live auth failed. Please check backend CORS allowlist for your frontend domain.',
          confirmButtonText: 'Close',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
