import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  name = '';
  email = '';
  message = '';

  submitForm() {
    console.log('Contact Form Submitted', {
      name: this.name,
      email: this.email,
      message: this.message
    });
    alert('Thank you for your message!');
    this.name = '';
    this.email = '';
    this.message = '';
  }
}
