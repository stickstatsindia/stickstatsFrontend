import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MembersService } from '../service/members/members-service';

@Component({
  selector: 'app-add-newplayer',
  templateUrl: './add-newplayer.html',
  styleUrls: ['./add-newplayer.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AddNewplayerComponent {
  // Remove other tabs and just keep phone number entry
  selectedTab = 0; // Since we only have one tab now
  playerForm: FormGroup;
  logoPreview: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder,private memeberService:MembersService) {
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
  teamtId:string=""; // Example team ID
  addTeam() {
    if (this.playerForm.valid) {
      // Submit logic here
      // alert('Team added!');
      console.log('Form Submitted', this.teamtId);
    if (this.playerForm.valid) {
      const teamData = { ...this.playerForm.value, tournamentId: this.teamtId };
      console.log('Team Data:', teamData);
      // if (!this.tournamentId) {
      //   console.error('No tournamentId provided!');
      //   return;
      // }
       this.memeberService.addMember(teamData).subscribe({
            next: (response: any) => {
              console.log('Tournament added successfully:', response);
           
            },
            error: (err: any) => {
              console.error('Error adding tournament:', err);
            }
          });
      console.log('Team data sent to service:', teamData);
    } else {
      this.playerForm.markAllAsTouched(); // Show validation errors
    }

    }
  }
}



