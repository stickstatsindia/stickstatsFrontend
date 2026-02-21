

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Profile } from '../service/profile/profile';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile-form.html',
  styleUrls: ['./profile-form.css']
})
export class ProfileForm {
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

  constructor(private http: HttpClient, private profileService: Profile) {}

  submitProfile() {
    if (this.locationValidationStatus !== 'valid') {
      alert('Please enter a valid 6-digit PIN to auto-fetch location.');
      return;
    }
  
    this.isUserRegistered=true;
    this.profileService.addUser(this.user).subscribe(response => {
      
      
      
      console.log('User added successfully:', response);



      alert('Profile saved successfully!');



    }, error => {
      console.error('Error adding user:', error);
      // Handle based on backend response
      if (error.status === 400) {
        alert(error.error.error || 'Validation failed. Please check your inputs.');
      } else if (error.status === 409) {
        alert(error.error.error || 'Duplicate entry detected.');
      } else if (error.status === 500) {
        alert('Server error: Could not create user. Please try again later.');
      } else {
        alert('Unexpected error occurred. Please try again.');
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
