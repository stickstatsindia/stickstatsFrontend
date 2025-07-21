import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-form.html',
  styleUrls: ['./profile-form.css']
})
export class ProfileForm {
  isProfileSaved = false;

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
    followers: 0,
    profileViews: 0,
    profileImage: ''
  };

  submitProfile() {
    if (this.user.name && this.user.email && this.user.mobile) {
      this.isProfileSaved = true;
    } else {
      alert('Please fill all required fields.');
    }
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
      this.user.pin
    ];
    const filled = fields.filter(f => f && f.trim() !== '').length;
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
}
