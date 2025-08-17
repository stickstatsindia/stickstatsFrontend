

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Profile } from '../service/profile/profile';

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
    full_name: '',
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

  constructor(private http: HttpClient, private profileService: Profile) {}

  submitProfile() {
  
    this.profileService.addUser(this.user).subscribe(response => {

      console.log('User added successfully:', response);
        this.isProfileSaved = true;
        alert('Profile saved successfully!');
    }, error => {
      console.error('Error adding user:', error);
    });
  }

  editProfile() {
    this.isProfileSaved = false;
  }

  get profileCompletion(): number {
    const fields = [
      this.user.full_name,
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