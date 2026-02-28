

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Profile } from '../service/profile/profile';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../config/api.config';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile-form.html',
  styleUrls: ['./profile-form.css']
})
export class ProfileForm implements OnInit {
  isProfileSaved = false;
  isUserRegistered=false;
  locationValidationStatus: 'pending' | 'valid' | 'invalid' = 'pending';
  isFetchingLocation = false;
  private lastLookupZip = '';
  private lookupSub: Subscription | null = null;
  private lookupToken = 0;

  user = {
    full_name: '',
    address: '',
    joinDate: new Date().toLocaleDateString(),
    phone_number: '',
    position: '',
    stickHand: '',
    date_of_birth: '',
    email: '',
    zip: '',
    gender: '',
    jersey_number: '',
    followers: 0,
    profileViews: 0,
    profileImage: ''
  };

  constructor(private http: HttpClient, private profileService: Profile, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {  // 👈 Only run in browser
      this.loadExistingProfile();
    }
  }

  loadExistingProfile() {
    const user_id = localStorage.getItem('user_id');
    const phone_number = localStorage.getItem('phone_number');

    // Always pre-fill phone from localStorage
    if (phone_number) {
      this.user.phone_number = phone_number;
    }

    if (!user_id) return;

    this.http.get<any>(`${environment.baseUrl}/api/users/${user_id}`)
      .subscribe({
        next: (data) => {
          // Pre-fill only fields that have real values
          this.user.full_name = data.full_name !== 'New User' ? data.full_name || '' : '';
          this.user.phone_number = data.phone_number || phone_number || '';
          this.user.email = data.email || '';
          this.user.address = data.address || '';
          this.user.date_of_birth = data.date_of_birth || '';
          this.user.gender = data.gender || '';
          this.user.position = data.position || '';
          this.user.jersey_number = data.jersey_number || '';
          this.user.zip = data.zip || '';
          this.user.profileImage = data.profile_pic || '';
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          // Not a breaking error, just continue with empty form
        }
      });
  }

  submitProfile() {

    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.locationValidationStatus !== 'valid') {
      alert('Please enter a valid 6-digit PIN to auto-fetch location.');
      return;
    }

    this.isUserRegistered = true;

    const user_id = localStorage.getItem('user_id');
    const phone_number = localStorage.getItem('phone_number');

    // Attach phone number from localStorage (already verified via OTP)
    const payload = {
      ...this.user,
      phone_number: phone_number || this.user.phone_number
    };

    // Use PUT to update the minimal user created during OTP
    this.http.put(`${environment.baseUrl}/api/users/${user_id}`, payload)
      .subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          alert('Profile saved successfully!');
          // Redirect to dashboard after profile completion
          this.router.navigate(['/search-tournaments']);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          if (error.status === 400) {
            alert(error.error.error || 'Validation failed.');
          } else if (error.status === 409) {
            alert(error.error.error || 'Duplicate entry detected.');
          } else if (error.status === 500) {
            alert('Server error. Please try again later.');
          } else {
            alert('Unexpected error occurred.');
          }
        }
      });
  }

  showProfile(){
    this.isProfileSaved = true;
  }

  editProfile() {
    this.isProfileSaved = false;
  }

  get profileCompletion(): number {
    const fields = [
      this.user.full_name,
      this.user.email,
      this.user.phone_number,
      this.user.address,
      this.user.date_of_birth,
      this.user.position,
      this.user.stickHand,
      this.user.gender,
      this.user.jersey_number,
      this.user.zip
    ];
    const filled = fields.filter(f => f && f.toString().trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.user.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  getMaxDate(): string {
    const today = new Date();
    const minAge = 5;
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }

// For login right now its dummy
  isLoggedIn: boolean = false;

  onLogin(): void {
    this.isLoggedIn = true;
  }

  onZipChange(zip: string): void {
    this.user.zip = (zip || '').replace(/\D/g, '').slice(0, 6);

    if (this.user.zip.length < 6) {
      this.locationValidationStatus = 'pending';
      this.lastLookupZip = '';
      this.user.address = '';
      return;
    }

    if (this.user.zip === this.lastLookupZip) {
      return;
    }

    this.fetchLocationFromPin(this.user.zip);
  }

  private fetchLocationFromPin(zip: string): void {
    this.lookupSub?.unsubscribe();
    const token = ++this.lookupToken;

    this.isFetchingLocation = true;
    this.locationValidationStatus = 'pending';
    this.lookupSub = this.http.get<any[]>(`https://api.postalpincode.in/pincode/${zip}`).subscribe({
      next: (response) => {
        const address = this.extractAddressFromPostalApi(response);
        if (token !== this.lookupToken) return;

        this.isFetchingLocation = false;
        this.lastLookupZip = zip;

        if (!address) {
          this.locationValidationStatus = 'invalid';
          this.user.address = '';
          return;
        }

        this.user.address = address;
        this.locationValidationStatus = 'valid';
      },
      error: () => {
        if (token !== this.lookupToken) return;

        this.isFetchingLocation = false;
        this.locationValidationStatus = 'invalid';
        this.user.address = '';
      }
    });
  }

  private extractAddressFromPostalApi(response: any[]): string {
    const first = Array.isArray(response) ? response[0] : null;
    const offices = first?.PostOffice;

    if (!first || first.Status !== 'Success' || !Array.isArray(offices) || !offices.length) {
      return '';
    }

    const district = this.getMostFrequentValue(
      offices.map((o: any) => (o?.District || '').toString().trim())
    );
    const state = this.getMostFrequentValue(
      offices.map((o: any) => (o?.State || '').toString().trim())
    );

    return [district, state].filter(Boolean).join(', ');
  }

  private getMostFrequentValue(values: string[]): string {
    const cleaned = values.filter(Boolean);
    if (!cleaned.length) return '';

    const counts = new Map<string, number>();
    const original = new Map<string, string>();

    for (const value of cleaned) {
      const key = value.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
      if (!original.has(key)) {
        original.set(key, value);
      }
    }

    let topKey = '';
    let topCount = 0;

    for (const [key, count] of counts.entries()) {
      if (count > topCount) {
        topKey = key;
        topCount = count;
      }
    }

    return original.get(topKey) || '';
  }

}
