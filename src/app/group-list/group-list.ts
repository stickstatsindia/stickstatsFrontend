// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { PoolService } from '../service/pool/pool';

// @Component({
//   selector: 'app-group-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './group-list.html',
// })
// export class GroupListComponent implements OnInit {
//   rowsPerPage = 10;
//   groups: any[] = [];

//   constructor(private poolService: PoolService) {}

//   ngOnInit() {
//     // ✅ Get pools from service
//     this.groups = this.poolService.getPools();
//     console.log('Groups loaded:', this.groups);
//   }

//   addNewGroup() {
//     alert('Redirect to Add Pool Page');
//   }

//   editGroup(group: any) {
//     alert(`Edit group: ${group.name}`);
//   }

//   deleteGroup(group: any) {
//     const confirmed = confirm(`Delete group "${group.name}"?`);
//     if (confirmed) {
//       this.poolService.deletePool(group);
//       this.groups = this.poolService.getPools();
//     }
//   }
// }
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoolService } from '../service/pool/pool';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-list.html',
})
export class GroupListComponent implements OnInit {
  rowsPerPage = 10;
  groups: any[] = [];

  constructor(private poolService: PoolService) {}

  // ngOnInit() {
  //   // subscribe to reactive pools
  //   this.poolService.pools$.subscribe((pools) => {
  //     this.groups = pools;
  //     console.log('Groups updated:', this.groups);
  //   });
  // }
ngOnInit() {
  this.poolService.pools$.subscribe((pools) => {
    this.groups = pools;   // ✅ always reflects latest state
    console.log('Groups updated:', this.groups);
  });
}

  addNewGroup() {
    alert('Redirect to Add Pool Page');
  }

  editGroup(group: any) {
    alert(`Edit group: ${group.name}`);
  }

  deleteGroup(group: any) {
    const confirmed = confirm(`Delete group "${group.name}"?`);
    if (confirmed) {
      this.poolService.deletePool(group);
    }
  }
}
