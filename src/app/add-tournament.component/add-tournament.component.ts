import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TournamentService } from '../service/tournament/tournament';
import { ActivatedRoute, Router } from '@angular/router';

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
  isEdit = false;
  tournamentCategories = ['OPEN', 'CORPORATE', 'COMMUNITY', 'SCHOOL', 'BOX'];
  groundTypes = ['ASTROTURF', 'GRASS'];
  matchTypes = ['7-A SIDE', '11-A SIDE', '5-A SIDE'];
  tournamentFormats = ['KNOCKOUT', 'LEAGUE'];

  selectedCategory: string | null = null;
  selectedGroundType: string | null = null;
  selectedMatchType: string | null = null;
  selectedFormat: string | null = null;
  tournamentId: any;

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tournamentForm = this.fb.group({
      tournament_name: ['', Validators.required],
      tournament_category: ['', Validators.required],
      location: ['', Validators.required],
      ground_type: ['', Validators.required],
      match_type: ['', Validators.required],
      format: ['', Validators.required],
      organiserName: [''], // Removed Validators.required since it's auto-fetched
      countryCode: ['+91', Validators.required],
      organiserContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      allowContact: [false],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],

    }, { validators: this.dateValidator });
  }

  ngOnInit(): void {
    this.tournamentId = this.route.snapshot.paramMap.get('tournament_id');
    // const state = nav?.extras.state as { tournamentId?: string };
    // this.tournamentId = state?.tournamentId || null;
    console.log('Tournament ID for edit:', this.tournamentId);
    if (this.tournamentId) {
    this.isEdit = true;
    this.loadTournamentForEdit();
  }

    // Auto-convert tournament name to title case
    this.tournamentForm.get('tournament_name')?.valueChanges.subscribe(value => {
      if (value) {
        const titleCased = this.toTitleCase(value);
        this.tournamentForm.get('tournament_name')?.setValue(titleCased, { emitEvent: false });
      }
    });
}
loadTournamentForEdit(): void {
  this.tournamentService.getTournamentById(this.tournamentId)
    .subscribe({
      next: (data: any) => {

        const startDate = data.start_date?.split('T')[0];
        const endDate = data.end_date?.split('T')[0];

        // Fetch organizer details if organizer_id exists
        if (data.organizer_id) {
          this.tournamentService.getUserById(data.organizer_id).subscribe({
            next: (user: any) => {
              data.organiserName = user.full_name;
              data.organiserContact = user.phone_number;
              this.patchFormData(data, startDate, endDate);
            },
            error: () => {
              console.error('Failed to fetch organizer details');
              this.patchFormData(data, startDate, endDate);
            }
          });
        } else {
          this.patchFormData(data, startDate, endDate);
        }
      }
    });
}

patchFormData(data: any, startDate: string, endDate: string): void {
  // ✅ 1. PATCH ALL VALUES FIRST
  this.tournamentForm.patchValue({
    tournament_name: data.tournament_name,
    tournament_category: data.tournament_category,
    location: data.location,
    ground_type: data.ground_type,
    match_type: data.match_type,
    format: data.format,
    organiserName: data.organiserName ?? '',
    organiserContact: data.organiserContact ?? '',
    start_date: startDate,
    end_date: endDate
  });

  // ✅ 3. UPDATE SELECTED VARIABLES FOR UI
  this.selectedCategory = data.tournament_category;
  this.selectedGroundType = data.ground_type;
  this.selectedMatchType = data.match_type;
  this.selectedFormat = data.format;

  // ✅ 2. THEN disable non-editable fields
  [
    'tournament_category',
    'location',
    'ground_type',
    'match_type',
    'format',
    'organiserName',
    'organiserContact',
    'countryCode',
    'allowContact'
  ].forEach(field =>
    this.tournamentForm.get(field)?.disable()
  );
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

  // Fetch organizer name and contact details
  fetchOrganizerDetails(): void {
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

  // onSubmit(): void {
  //   if (this.tournamentForm.valid) {
  //     const formData = this.tournamentForm.value;
  //     if (this.isEdit) {
  //   this.updateTournament();
  //   return;
  // } 

  //     const userPhone = formData.organiserContact;

  //     // Step 1: Fetch user by phone
  //     this.tournamentService.getUserByPhone(userPhone).subscribe({
  //       next: (user: User) => {
  //         console.log('User details fetched successfully:', user);

  //         // Step 2: Attach organiserId to formData
  //         const updatedFormData = {
  //           ...formData,
  //           organizer_id: user?.['user_id'] // Adjust based on API response
  //         };

  //         // Step 3: Call addTournament with organiserId included
  //         this.tournamentService.addTournament(updatedFormData).subscribe({
  //           next: (response: any) => {
  //             console.log('Tournament added successfully:', response);
  //             this.tournamentForm.reset();
  //             this.selectedCategory = null;
  //             this.selectedGroundType = null;
  //             this.selectedMatchType = null;
  //             this.selectedFormat = null;
  //             this.router.navigate(['/tournament-dashboard']);
  //           },
  //           error: (err: any) => {
  //             console.error('Error adding tournament:', err);
  //           }
  //         });
  //       },
  //       error: (err: any) => {
  //         console.error('Error fetching user details:', err);
  //       }
  //     });

  //   } else {
  //     this.tournamentForm.markAllAsTouched();
  //   }
  // }
  onSubmit(): void {
  if (this.tournamentForm.invalid) {
    this.tournamentForm.markAllAsTouched();
    return;
  }

  if (this.isEdit) {
    this.updateTournament();
  } else {
    this.addTournament();
  }
}
addTournament(): void {
  const formData = this.tournamentForm.value;
  const userPhone = formData.organiserContact;

  this.tournamentService.getUserByPhone(userPhone).subscribe({
    next: (user: User) => {
      const payload = {
        ...formData,
        organizer_id: user?.['user_id']
      };

      this.tournamentService.addTournament(payload).subscribe({
        next: () => {
          this.router.navigate(['/tournament-dashboard']);
        }
      });
    }
  });
}
updateTournament(): void {
  const payload = {
    tournament_name: this.tournamentForm.get('tournament_name')?.value,
    start_date: this.tournamentForm.get('start_date')?.value,
    end_date: this.tournamentForm.get('end_date')?.value
  };

  this.tournamentService.editTournament(this.tournamentId, payload)
    .subscribe({
      next: () => {
        alert('Tournament updated successfully');
        this.router.navigate(['/tournaments']);
      },
      error: (err) => {
        console.error('Update failed', err);
      }
    });
}

  // Helper method to convert string to title case
  private toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

}

