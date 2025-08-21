// // import { CommonModule } from '@angular/common';
// // import { Component, OnInit } from '@angular/core';
// // import { FormsModule } from '@angular/forms';
// // import { PoolService } from '../service/pool/pool';

// // @Component({
// //   selector: 'app-group-list',
// //   standalone: true,
// //   imports: [CommonModule, FormsModule],
// //   templateUrl: './group-list.html',
// // })
// // export class GroupListComponent implements OnInit {
// //   rowsPerPage = 10;
// //   groups: any[] = [];

// //   constructor(private poolService: PoolService) {}

// //   ngOnInit() {
// //     // ✅ Get pools from service
// //     this.groups = this.poolService.getPools();
// //     console.log('Groups loaded:', this.groups);
// //   }

// //   addNewGroup() {
// //     alert('Redirect to Add Pool Page');
// //   }

// //   editGroup(group: any) {
// //     alert(`Edit group: ${group.name}`);
// //   }

// //   deleteGroup(group: any) {
// //     const confirmed = confirm(`Delete group "${group.name}"?`);
// //     if (confirmed) {
// //       this.poolService.deletePool(group);
// //       this.groups = this.poolService.getPools();
// //     }
// //   }
// // }
// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
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

//   constructor(private poolService: PoolService, private router: Router) {}

//   ngOnInit() {
//     // ✅ subscribe to BehaviorSubject so groups auto-update
//     this.poolService.pools$.subscribe((pools) => {
//       this.groups = pools;
//       console.log('Groups updated:', this.groups);
//     });
//   }

//   addNewGroup() {
//     // ✅ navigate to add-group page instead of alert
//     this.router.navigate(['/add-group']);
//   }

//   editGroup(group: any) {
//     alert(`Edit group: ${group.name}`);
//   }

//   deleteGroup(group: any) {
//     const confirmed = confirm(`Delete group "${group.name}"?`);
//     if (confirmed) {
//       this.poolService.deletePool(group);
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoolService } from '../service/pool/pool';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-list.html',
})
export class GroupListComponent implements OnInit {
  groups: any[] = [];
  rowsPerPage = 5;

  constructor(private poolService: PoolService, private router: Router) {}

  ngOnInit() {
    this.poolService.pools$.subscribe((pools) => {
      this.groups = pools;
    });
  }

  addNewGroup() {
    this.router.navigate(['/add-group']);
  }

  editGroup(group: any) {
    this.router.navigate(['/add-group'], { state: { pool: group } });
  }

  deleteGroup(group: any) {
    if (confirm(`Delete group "${group.name}"?`)) {
      this.poolService.deletePool(group);
    }
  }
}
