import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addnew-team.html',
  styleUrls: ['./addnew-team.css']
})
export class AddTeamComponent {
  teamName = '';
  city = '';
  cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
  logoUrl: string | ArrayBuffer | null = null;

  onLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => this.logoUrl = reader.result;
      reader.readAsDataURL(input.files[0]);
    }
  }
}