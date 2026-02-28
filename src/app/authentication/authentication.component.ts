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

  constructor(private http: HttpClient, private router: Router, @Inject(DOCUMENT) private document: Document, @Inject(PLATFORM_ID) private platformId: Object, private authService: AuthService) {}

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

      this.http.post<any>(`${environment.baseUrl}/auth/phone-email`, { user_json_url })
        .subscribe({
          next: (res) => {
            console.log('Response from backend:', res);         // 👈 Check this
            console.log('isNewUser value:', res.isNewUser);

            // Use auth service to store token and notify subscribers
            this.authService.login(res.token, res.user_id, res.phone_number);

            if (res.isNewUser) {
              this.router.navigate(['/profile-form']); // → ProfileForm
            } else {
              this.router.navigate(['/search-tournaments']); // → SearchTournaments
            }
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Authentication Failed',
              text: 'We could not sign you in. Please try again.',
              confirmButtonText: 'Close',
              confirmButtonColor: '#d33' // You can customize this to match your app's theme
            });
          }
        });
    };
  }
}
