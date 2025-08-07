import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-list',
  imports: [CommonModule,FormsModule],
  templateUrl: './group-list.html',
})
export class GroupListComponent {
  rowsPerPage = 10;

  groups = [
    {
      name: '',
      teams: [''],
    },
    {
      name: '',
      teams: ['', ''],
    },
  ];

  addNewGroup() {
    alert('Redirect to Add Group Page');
  }

  editGroup(group: any) {
    console.log('Edit:', group);
    alert(`Edit group: ${group.name}`);
  }

  deleteGroup(group: any) {
    const confirmed = confirm(`Delete group "${group.name}"?`);
    if (confirmed) {
      this.groups = this.groups.filter(g => g !== group);
    }
  }
}
