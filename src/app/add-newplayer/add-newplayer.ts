import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MembersService } from '../service/members/members-service';
import { TournamentService } from '../service/tournament/tournament';
import { Router } from '@angular/router';

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
  team_id: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(private fb: FormBuilder, private memeberService: MembersService, private tournamentService: TournamentService, private router: Router) {
    const nav = this.router.getCurrentNavigation();
    console.log('Navigation State:', nav?.extras.state);
    const state = nav?.extras.state as { teamId?: string };
    console.log('Extracted State:', state);
    this.team_id= state?.teamId || null;
    this.playerForm = this.fb.group({
      playerName: ['', Validators.required],
      phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });

    // Listen for phone number changes to auto-fetch player name
    this.playerForm.get('phone_number')?.valueChanges.subscribe(() => {
      this.fetchPlayerByPhone();
    });
  }

  selectTab(idx: number) {
    this.selectedTab = idx;
  }

  // Fetch player name when phone entered
  fetchPlayerByPhone(): void {
    const phone = this.playerForm.get('phone_number')?.value;
    if (!phone || this.playerForm.get('phone_number')?.invalid) {
      this.errorMessage = null;
      this.successMessage = null;
      this.messageType = null;
      return;
    }

    this.tournamentService.getUserByPhone(phone).subscribe({
      next: (user: any) => {
        console.log("✅ User found:", user);
        const playerName = user.full_name || user.name || '';
        this.playerForm.patchValue({ playerName: playerName });
        this.errorMessage = null;
      },
      error: () => {
        console.error("❌ No user found with phone:", phone);
        this.errorMessage = "No user found with this phone number. User must register first!";
        this.successMessage = null;
        this.messageType = 'error';
        this.playerForm.patchValue({ playerName: '' });
      }
    });
  }

  teamtId:string=""; // Example team ID
  addTeam() {
    if (this.playerForm.valid) {
      // Submit logic here
      // alert('Team added!');
      console.log('Form Submitted', this.teamtId);
    if (this.playerForm.valid) {
      // Remove teamLogo from submission - only send playerName and phone_number
      const teamData = { ...this.playerForm.value, teamId: this.team_id };
      console.log('Team Data:', teamData);
      // if (!this.tournamentId) {
      //   console.error('No tournamentId provided!');
      //   return;
      // }
       this.memeberService.addMember(teamData).subscribe({
            next: (response: any) => {
              console.log('Tournament added successfully:', response);
              this.successMessage = response.message || 'Player added successfully!';
              this.errorMessage = null;
              this.messageType = 'success';
              
              // Auto-navigate after 2 seconds
              setTimeout(() => {
                this.router.navigate(['/team-members'], { state: { teamId: this.team_id } });
              }, 2000);
           
            },
            error: (err: any) => {
              console.error('Error adding tournament:', err);
              this.errorMessage = err.error?.error || 'Error adding player. Please try again.';
              this.successMessage = null;
              this.messageType = 'error';
            }
          });
      console.log('Team data sent to service:', teamData);
    } else {
      this.playerForm.markAllAsTouched(); // Show validation errors
    }
  }
    
}

}

