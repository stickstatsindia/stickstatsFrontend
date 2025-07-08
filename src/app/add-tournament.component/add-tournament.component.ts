import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-tournament',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './add-tournament.component.html',
  styleUrls: ['./add-tournament.component.css']
})
export class AddTournamentComponent {
  tournamentForm: FormGroup;

  tournamentCategories = ['OPEN', 'CORPORATE', 'COMMUNITY', 'SCHOOL', 'BOX'];
  cities = []; // Extend as needed
  groundTypes = ['ASTROTURF', 'GRASS'];
  matchTypes = ['7-A SIDE', '11-A SIDE', '5-A SIDE'];

  selectedCategories = new Set<string>();
  selectedGroundTypes = new Set<string>();
  selectedMatchTypes = new Set<string>();

  constructor(private fb: FormBuilder) {
    this.tournamentForm = this.fb.group({
      tournamentName: ['', Validators.required],
      tournamentCategory: [[]],
      city: ['', Validators.required],
      ground: ['', Validators.required],
      groundType: [[]],
      matchType: [[]],
      organiserName: ['', Validators.required],
      countryCode: ['', Validators.required],
      organiserContact: ['', Validators.required],
      allowContact: [false],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
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

  private toggleSelection(set: Set<string>, value: string): void {
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
  }

  onSubmit(): void {
    if (this.tournamentForm.valid) {
      console.log('Tournament Form Submitted:', this.tournamentForm.value);
      // TODO: handle submission logic
    } else {
      this.tournamentForm.markAllAsTouched();
    }
  }
}
