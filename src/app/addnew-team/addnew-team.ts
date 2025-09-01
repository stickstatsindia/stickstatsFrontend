import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
export class AddTeamComponent {
  teamForm: FormGroup;
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
  "Warangal"
];


  logoUrl: string | ArrayBuffer | null = null;
  tournamentId: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private addTeamService: AddTeam, private tournamentService: TournamentService) {
    // Get tournamentId from navigation state
    const nav = this.router.getCurrentNavigation();
    console.log('Navigation State:', nav?.extras.state);
    const state = nav?.extras.state as { tournamentId?: string };
    console.log('Extracted State:', state);
    this.tournamentId = state?.tournamentId || null;
    this.teamForm = this.fb.group({
      team_name: ['', Validators.required],
      city: ['', Validators.required],
      logo_url: [null]
    });
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
    console.log('Form Submitted', this.tournamentId);
    if (this.teamForm.valid) {
      const teamData = { ...this.teamForm.value, tournamentId: this.tournamentId };
      console.log('Team Data:', teamData);
      // if (!this.tournamentId) {
      //   console.error('No tournamentId provided!');
      //   return;
      // }
       this.addTeamService.addTeam(teamData).subscribe({
            next: (response: any) => {
              console.log('Tournament added successfully:', response);
           
            },
            error: (err: any) => {
              console.error('Error adding tournament:', err);
            }
          });
      console.log('Team data sent to service:', teamData);
    } else {
      this.teamForm.markAllAsTouched(); // Show validation errors
    }
  }
}
