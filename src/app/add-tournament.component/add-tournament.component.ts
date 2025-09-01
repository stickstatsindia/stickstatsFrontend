import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TournamentService } from '../service/tournament/tournament';
import { Router } from '@angular/router';

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
  errorMessage: string | null = null; // For showing validation errors

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
    private tournamentService: TournamentService,
    private router: Router
  ) {
    this.tournamentForm = this.fb.group({
      tournament_name: ['', Validators.required],
      tournament_category: ['', Validators.required],
      location: ['', Validators.required],
      ground_type: ['', Validators.required],
      match_type: ['', Validators.required],
      format: ['', Validators.required],
      organiserName: ['', Validators.required],
      countryCode: ['+91', Validators.required],
      organiserContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      allowContact: [false],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],

    }, { validators: this.dateValidator });
  }

  //  Custom validator for dates
  dateValidator(formGroup: FormGroup) {
    const start = new Date(formGroup.get('start_date')?.value);
    const end = new Date(formGroup.get('end_date')?.value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (!start || !end) return null;

    if (start < today) {
      return { startPast: true };
    }
    if (end <= start) {
      return { endBeforeStart: true };
    }
    return null;
  }

  toggleCategory(category: string): void {
    this.selectedCategory = category;
    this.tournamentForm.patchValue({ tournament_category: category });
    this.tournamentForm.get('category')?.markAsTouched();
  }

  toggleGroundType(type: string): void {
    this.selectedGroundType = type;
    this.tournamentForm.patchValue({ ground_type: type });
    this.tournamentForm.get('type')?.markAsTouched();
  }

  toggleMatchType(type: string): void {
    this.selectedMatchType = type;
    this.tournamentForm.patchValue({ match_type: type });
    this.tournamentForm.get('type')?.markAsTouched();
  }

  toggleFormat(format: string): void {
    this.selectedFormat = format;
    this.tournamentForm.patchValue({ format: format });
    this.tournamentForm.get('format')?.markAsTouched();
  }

  //  Fetch organizer name when phone entered
  fetchOrganizerByPhone(): void {
    const phone = this.tournamentForm.get('organiserContact')?.value;
    if (!phone || this.tournamentForm.get('organiserContact')?.invalid) return;

    this.tournamentService.getUserByPhone(phone).subscribe({
      next: (user: any) => {
        console.log("✅ User found:", user);
        this.tournamentForm.patchValue({ organiserName: user.full_name });
        this.errorMessage = null;
      },
      error: () => {
        console.error("❌ No user found:");
        this.errorMessage = "No user found with this phone number. Organizer must register first!";
        this.tournamentForm.patchValue({ organiserName: '' });
      }
    });
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
            organizer_id: user?.['user_id'] // Adjust based on API response
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
              this.router.navigate(['/tournament-dashboard']);
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

