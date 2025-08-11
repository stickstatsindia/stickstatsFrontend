import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tournament } from '../service/tournament/tournament';


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

  selectedCategories = new Set<string>();
  selectedGroundTypes = new Set<string>();
  selectedMatchTypes = new Set<string>();
  selectedFormats = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private tournamentService: Tournament
  ) {
    this.tournamentForm = this.fb.group({
      tournament_name: ['', Validators.required],
      tournament_category: [[]],
      location: ['', Validators.required],
      ground_type: [[]],
      match_type: [[]],
      format: [[], Validators.required],
      organiserName: ['', Validators.required],
      countryCode: ['', Validators.required],
      organiserContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      allowContact: [false],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    });
  }

  toggleSelection(set: Set<string>, value: string): void {
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
  }

  toggleCategory(category: string): void {
    this.toggleSelection(this.selectedCategories, category);
    this.tournamentForm.patchValue({
      tournament_category: Array.from(this.selectedCategories)
    });
  }

  toggleGroundType(type: string): void {
    this.toggleSelection(this.selectedGroundTypes, type);
    this.tournamentForm.patchValue({
      ground_type: Array.from(this.selectedGroundTypes)
    });
  }

  toggleMatchType(type: string): void {
    this.toggleSelection(this.selectedMatchTypes, type);
    this.tournamentForm.patchValue({
      match_type: Array.from(this.selectedMatchTypes)
    });
  }

  toggleFormat(format: string): void {
    this.selectedFormats.clear(); // Only one format allowed
    this.selectedFormats.add(format);
    this.tournamentForm.patchValue({
      format: [format]
    });
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      const formData = this.tournamentForm.value;
      console.log('Submitting tournament:', formData);

      this.tournamentService.addTournament(formData).subscribe({
        next: (response) => {
          console.log('Tournament added successfully:', response);
          // Optional: reset form or show toast
        },
        error: (err) => {
          console.error('Error adding tournament:', err);
          // Optional: show error alert
        }
      });
    } else {
      // this.tournamentForm.markAllAsTouched();
    }
  }
}
