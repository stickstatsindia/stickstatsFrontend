import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-phone-auth',
  standalone: true,
  templateUrl: './authentication.component.html'
})
export class AuthenticationComponent implements OnInit {

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPhoneEmailScript();
  }

  loadPhoneEmailScript() {
    const script = document.createElement('script');
    script.src = 'https://www.phone.email/sign_in_button_v1.js';
    script.async = true;
    document.body.appendChild(script);

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
