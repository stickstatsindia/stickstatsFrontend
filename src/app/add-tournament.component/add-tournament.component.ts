import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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
  tournamentFormats = ['KNOCKOUT', 'LEAGUE']; // ✅ NEW

  selectedCategories = new Set<string>();
  selectedGroundTypes = new Set<string>();
  selectedMatchTypes = new Set<string>();
  selectedFormats = new Set<string>(); // ✅ NEW

  constructor(private fb: FormBuilder) {
    this.tournamentForm = this.fb.group({
      tournamentName: ['', Validators.required],
      tournamentCategory: [[]],
      city: ['', Validators.required],
      ground: ['', Validators.required],
      groundType: [[]],
      matchType: [[]],
      tournamentFormat: [[], Validators.required], // ✅ NEW
      organiserName: ['', Validators.required],
      countryCode: ['', Validators.required],
      organiserContact: ['', Validators.required],
      allowContact: [false],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
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
      tournamentCategory: Array.from(this.selectedCategories)
    });
  }

  toggleGroundType(type: string): void {
    this.toggleSelection(this.selectedGroundTypes, type);
    this.tournamentForm.patchValue({
      groundType: Array.from(this.selectedGroundTypes)
    });
  }

  toggleMatchType(type: string): void {
    this.toggleSelection(this.selectedMatchTypes, type);
    this.tournamentForm.patchValue({
      matchType: Array.from(this.selectedMatchTypes)
    });
  }

  toggleFormat(format: string): void {
    this.selectedFormats.clear(); // Only one selectable
    this.selectedFormats.add(format);
    this.tournamentForm.patchValue({
      tournamentFormat: [format]
    });
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      console.log('Tournament Form Submitted:', this.tournamentForm.value);
      // Add submission logic here
    } else {
      this.tournamentForm.markAllAsTouched();
    }
  }
}
