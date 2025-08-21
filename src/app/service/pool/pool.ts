// import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
// export class PoolService {
//   pools: any[] = [];

//   getPools() {
//     return this.pools;
//   }

//   addPool(pool: any) {
//     this.pools.push(pool);
//   }

//   deletePool(pool: any) {
//     this.pools = this.pools.filter(p => p !== pool);
//   }
// }
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PoolService {
  private poolsSubject = new BehaviorSubject<any[]>([]);
  pools$ = this.poolsSubject.asObservable();

  constructor() {
    // preload with sample pools
    this.poolsSubject.next([
      { name: 'Pool A', type: 'League', teams: ['RCB'] },
      { name: 'Pool B', type: 'Knockout', teams: ['Abc'] },
    ]);
  }

  getPools() {
    return this.poolsSubject.value;
  }

  addPool(pool: any) {
    const updated = [...this.poolsSubject.value, pool];
    this.poolsSubject.next(updated);
  }

  deletePool(pool: any) {
    const updated = this.poolsSubject.value.filter((p) => p !== pool);
    this.poolsSubject.next(updated);
  }
}
