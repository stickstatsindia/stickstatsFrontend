import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AddTeam } from '../service/team/add-team';
import { TournamentService } from '../service/tournament/tournament';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-add-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './addnew-team.html',
  styleUrls: ['./addnew-team.css']
})
export class AddTeamComponent implements OnInit {
  teamForm: FormGroup;
  isEdit = false;
  teamId: string | null = null;
  tournamentId: string | null = null;
cities = [
  "Agra",
  "Ahmedabad",
  "Aligarh",
  "Allahabad (Prayagraj)",
  "Amritsar",
  "Aizawl",
  "Aurangabad",
  "Bareilly",
  "Bangalore",
  "Bhopal",
  "Bhubaneswar",
  "Chandigarh",
  "Chennai",
  "Coimbatore",
  "Cuttack",
  "Dehradun",
  "Delhi",
  "Faridabad",
  "Gangtok",
  "Ghaziabad",
  "Goa",
  "Gurgaon",
  "Guwahati",
  "Gwalior",
  "Haridwar",
  "Hyderabad",
  "Imphal",
  "Indore",
  "Jaipur",
  "Jabalpur",
  "Jammu",
  "Jamshedpur",
  "Jodhpur",
  "Kanpur",
  "Kochi",
  "Kohima",
  "Kolkata",
  "Kota",
  "Kozhikode",
  "Lucknow",
  "Ludhiana",
  "Madurai",
  "Mangalore",
  "Margao",
  "Meerut",
  "Moradabad",
  "Mumbai",
  "Mysore",
  "Nagpur",
  "Nashik",
  "Noida",
  "Panaji",
  "Patna",
  "Puducherry",
  "Pune",
  "Rajkot",
  "Ranchi",
  "Rourkela",
  "Shillong",
  "Srinagar",
  "Surat",
  "Thane",
  "Thiruvananthapuram",
  "Tiruchirappalli",
  "Tirupati",
  "Udaipur",
  "Varanasi",
  "Vijayawada",
  "Visakhapatnam",
  "Warangal",
  "Other"
];


  logoUrl: string | ArrayBuffer | null = null;
 // tournamentId: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private addTeamService: AddTeam, private tournamentService: TournamentService) {
    // Get tournamentId from navigation state
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { tournamentId?: string };
    this.tournamentId = state?.tournamentId || null;
    this.teamForm = this.fb.group({
      team_name: ['', Validators.required],
      city: ['', Validators.required],
      logo_url: [null]
    });
  }

  ngOnInit() {
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.tournamentId = this.route.snapshot.queryParamMap.get('tournamentId') || this.tournamentId;
    if (this.teamId) {
      this.isEdit = true;
      this.loadTeamForEdit();
    }

    // Auto-convert team name to title case
    this.teamForm.get('team_name')?.valueChanges.subscribe(value => {
      if (value) {
        const titleCased = this.toTitleCase(value);
        this.teamForm.get('team_name')?.setValue(titleCased, { emitEvent: false });
      }
    });
  }

  loadTeamForEdit() {
    if (this.teamId) {
      this.addTeamService.getTeamById(this.teamId).subscribe({
        next: (team: any) => {
          console.log('Loaded team for edit:', team);
          this.teamForm.patchValue({
            team_name: team.team_name,
            city: team.location,
            logo_url: team.logo_url
          });
          // Disable non-editable fields
          this.teamForm.get('city')?.disable();
          this.teamForm.get('logo_url')?.disable();
        },
        error: (err) => {
          console.error('Failed to load team', err);
        }
      });
    }
  }

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoUrl = reader.result;
        this.teamForm.patchValue({ logo_url: this.logoUrl });
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit() {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    if (this.isEdit) {
      this.updateTeam();
    } else {
      this.addTeam();
    }
  }

  addTeam() {
    const teamData = { ...this.teamForm.value, tournamentId: this.tournamentId };
    this.addTeamService.addTeam(teamData).subscribe({
      next: () => {
        this.router.navigate(['/show-teams'], { state: { tournamentId: this.tournamentId } });
      },
      error: (err) => {
        console.error('Error adding team:', err);
      }
    });
  }

  updateTeam() {
    const teamData = { team_name: this.teamForm.get('team_name')?.value };
    this.addTeamService.updateTeam(this.teamId!, teamData).subscribe({
      next: () => {
        alert('Team updated successfully');
        this.router.navigate(['/show-teams'], { state: { tournamentId: this.tournamentId } });
      },
      error: (err: any) => {
        console.error('Update failed', err);
        alert('Failed to update team: ' + (err.error?.error || 'Unknown error'));
      }
    });
  }

  // Helper method to convert string to title case
  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}
