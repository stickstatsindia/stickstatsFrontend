

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Profile } from '../service/profile/profile';
import { Navbar } from '../navbar/navbar';

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
    this.isUserRegistered = true;

    const user_id = localStorage.getItem('user_id');
    const phone_number = localStorage.getItem('phone_number');

    // Attach phone number from localStorage (already verified via OTP)
    const payload = {
      ...this.user,
      phone_number: phone_number || this.user.phone_number
    };

    // Use PUT to update the minimal user created during OTP
    this.http.put(`http://localhost:3000/api/users/${user_id}`, payload)
      .subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          alert('Profile saved successfully!');
          // Redirect to dashboard after profile completion
          // this.router.navigate(['/dashboard']);
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

}