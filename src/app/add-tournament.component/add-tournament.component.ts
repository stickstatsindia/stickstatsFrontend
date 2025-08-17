import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tournament } from '../service/tournament/tournament';

// Define a User interface for type safety (must be outside the class)
interface User {
  id?: string;
  _id?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-add-tournament',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-tournament.component.html',
  styleUrls: ['./add-tournament.component.css']
})
export class AddTournamentComponent {
  tournamentForm: FormGroup;

  tournamentCategories = ['OPEN', 'CORPORATE', 'COMMUNITY', 'SCHOOL', 'BOX'];
  groundTypes = ['ASTROTURF', 'GRASS'];
  matchTypes = ['7-A SIDE', '11-A SIDE', '5-A SIDE'];
  tournamentFormats = ['KNOCKOUT', 'LEAGUE'];

  selectedCategory: string | null = null;
  selectedGroundType: string | null = null;
  selectedMatchType: string | null = null;
  selectedFormat: string | null = null;

  constructor(
    private fb: FormBuilder,
    private tournamentService: Tournament
  ) {
    this.tournamentForm = this.fb.group({
      tournament_name: ['', Validators.required],
      tournament_category: ['', Validators.required],
      location: ['', Validators.required],
      ground_type: ['', Validators.required],
      match_type: ['', Validators.required],
      format: ['', Validators.required],
      organiserName: ['', Validators.required],
      countryCode: ['', Validators.required],
      organiserContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      allowContact: [false],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    });
  }

  toggleCategory(category: string): void {
    this.selectedCategory = category;
    this.tournamentForm.patchValue({ tournament_category: category });
  }

  toggleGroundType(type: string): void {
    this.selectedGroundType = type;
    this.tournamentForm.patchValue({ ground_type: type });
  }

  toggleMatchType(type: string): void {
    this.selectedMatchType = type;
    this.tournamentForm.patchValue({ match_type: type });
  }

  toggleFormat(format: string): void {
    this.selectedFormat = format;
    this.tournamentForm.patchValue({ format: format });
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const formData = this.tournamentForm.value;
      console.log('Submitting tournament:', formData);

      const userPhone = formData.organiserContact;

      // Step 1: Fetch user by phone
      this.tournamentService.getUserByPhone(userPhone).subscribe({
        next: (user: User) => {
          console.log('User details fetched successfully:', user);

          // Step 2: Attach organiserId to formData
          const updatedFormData = {
            ...formData,
            organiserId: user?.id || user?._id  // Adjust based on API response
          };

          // Step 3: Call addTournament with organiserId included
          this.tournamentService.addTournament(updatedFormData).subscribe({
            next: (response: any) => {
              console.log('Tournament added successfully:', response);
              this.tournamentForm.reset();
              this.selectedCategory = null;
              this.selectedGroundType = null;
              this.selectedMatchType = null;
              this.selectedFormat = null;
            },
            error: (err: any) => {
              console.error('Error adding tournament:', err);
            }
          });
        },
        error: (err: any) => {
          console.error('Error fetching user details:', err);
        }
      });

    } else {
      this.tournamentForm.markAllAsTouched();
    }
  }
}

