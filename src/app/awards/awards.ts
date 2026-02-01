import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-awards',
  imports: [],
  templateUrl: './awards.html',
  styleUrl: './awards.css'
})
export class Awards {
@Input() userId!: string;
}
