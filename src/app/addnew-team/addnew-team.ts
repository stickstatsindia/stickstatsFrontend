import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-team',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addnew-team.html',
  styleUrls: ['./addnew-team.css']
})
export class AddTeamComponent {
  teamForm: FormGroup;
  cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
  logoUrl: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder) {
    this.teamForm = this.fb.group({
      teamName: ['', Validators.required],
      city: ['', Validators.required],
      logo: [null]
    });
  }

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoUrl = reader.result;
        this.teamForm.patchValue({ logo: this.logoUrl });
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit() {
    if (this.teamForm.valid) {
      console.log('Team Data:', this.teamForm.value);
      
    } else {
      this.teamForm.markAllAsTouched(); // Show validation errors
    }
  }
}
