import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-manager',
  templateUrl: './group-manager.html',
  imports: [CommonModule,FormsModule],
  styleUrls: ['./group-manager.css']
})
export class GroupManagerComponent {
  groups = [
    {
      roundName: 'Super Knockout',
      name: 'Group 1',
      teams: [{ name: 'RCB' }, { name: 'MI' }],
      isEditing: false
    },
    {
      roundName: 'Super Knockout',
      name: 'Group 2',
      teams: [{ name: 'RR' }],
      isEditing: false
    }
  ];

  groupCount = this.groups.length;

  createGroup() {
    this.groupCount++;
    this.groups.push({
      roundName: 'Super Knockout',
      name: `Group ${this.groupCount}`,
      teams: [],
      isEditing: false
    });
  }

  joinGroup() {
    const randomGroup = this.groups[Math.floor(Math.random() * this.groups.length)];
    const newTeamName = 'Team ' + (randomGroup.teams.length + 1);
    randomGroup.teams.push({ name: newTeamName });
  }

  toggleEdit(group: any) {
    if (group.isEditing) {
      // Save mode
      group.isEditing = false;
    } else {
      // Edit mode
      group.isEditing = true;
    }
  }

  deleteGroup(groupToDelete: any) {
    this.groups = this.groups.filter(group => group !== groupToDelete);
  }
}
