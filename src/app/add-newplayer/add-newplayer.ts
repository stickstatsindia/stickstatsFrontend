import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-newplayer',
  templateUrl: './add-newplayer.html',
  styleUrls: ['./add-newplayer.css'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class AddNewplayerComponent {
  tabs = [
    { label: 'MY NETWORK' },
    { label: 'SEARCH' },
    { label: 'ADD VIA PHONE NUMBER' },
    { label: 'ADD VIA EXCEL SHEET' }
  ];
  selectedTab = 2; // Default to "ADD VIA PHONE NUMBER"
  playerForm: FormGroup;
  logoPreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder) {
    this.playerForm = this.fb.group({
      playerName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      teamLogo: [null]
    });
  }

  selectTab(idx: number) {
    this.selectedTab = idx;
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file && file.size < 100 * 1024) {
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result;
      reader.readAsDataURL(file);
      this.playerForm.patchValue({ teamLogo: file });
    } else {
      alert('Logo must be <100kb');
    }
  }

  addTeam() {
    if (this.playerForm.valid) {
      // Submit logic here
      alert('Team added!');
    }
  }
}



