

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile-form.html',
  styleUrls: ['./profile-form.css']
})
export class ProfileForm {
  isProfileSaved = false;
  locationValidationStatus: 'pending' | 'valid' | 'invalid' = 'pending';

  user = {
    name: '',
    location: '',
    joinDate: new Date().toLocaleDateString(),
    mobile: '',
    position: '',
    stickHand: '',
    dob: '',
    email: '',
    pin: '',
    gender: '',
    jerseyNumber: '',
    followers: 0,
    profileViews: 0,
    profileImage: ''
  };

  constructor(private http: HttpClient) {}

  submitProfile() {
    this.isProfileSaved = true;
  }

  editProfile() {
    this.isProfileSaved = false;
  }

  get profileCompletion(): number {
    const fields = [
      this.user.name,
      this.user.email,
      this.user.mobile,
      this.user.location,
      this.user.dob,
      this.user.position,
      this.user.stickHand,
      this.user.gender,
      this.user.jerseyNumber,
      this.user.pin
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
}