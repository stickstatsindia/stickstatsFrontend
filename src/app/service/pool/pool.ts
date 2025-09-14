
// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { isPlatformBrowser } from '@angular/common';

// @Injectable({
//   providedIn: 'root',
// })
// export class PoolService {
//   private poolsSubject = new BehaviorSubject<any[]>([]);
//   pools$ = this.poolsSubject.asObservable();
//   private isBrowser: boolean;

//   constructor(@Inject(PLATFORM_ID) platformId: Object) {
//     this.isBrowser = isPlatformBrowser(platformId);

//     if (this.isBrowser) {
//       const saved = localStorage.getItem('pools');
//       if (saved) {
//         this.poolsSubject.next(JSON.parse(saved));
//       }
//     }
//   }

//   getPools() {
//     return this.poolsSubject.value;
//   }

//   addPool(pool: any) {
//     const updated = [...this.poolsSubject.value, pool];
//     this.poolsSubject.next(updated);

//     if (this.isBrowser) {
//       localStorage.setItem('pools', JSON.stringify(updated));
//     }
//   }

//   deletePool(pool: any) {
//     const updated = this.poolsSubject.value.filter((p) => p !== pool);
//     this.poolsSubject.next(updated);

//     if (this.isBrowser) {
//       localStorage.setItem('pools', JSON.stringify(updated));
//     }
//   }
// }
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PoolService {
  private poolsSubject = new BehaviorSubject<any[]>([]);
  // pools$ = this.poolsSubject.asObservable();
  // private isBrowser: boolean;
config = environment;
  constructor(@Inject(PLATFORM_ID) platformId: Object,
              private http: HttpClient) {
    // this.isBrowser = isPlatformBrowser(platformId);

    // if (this.isBrowser) {
    //   const storedPools = localStorage.getItem('pools');
    //   if (storedPools) {
    //     this.poolsSubject.next(JSON.parse(storedPools));
    //   }
    // }
  }

  getPools() {
    return this.poolsSubject.value;
  }

  // addPool(pool: any) {
  //   const updated = [...this.poolsSubject.value, pool];
  //   this.poolsSubject.next(updated);
  //   this.saveToLocal(updated);
  // }

  // updatePool(oldPool: any, updatedPool: any) {
  //   const pools = this.poolsSubject.value.map((p) =>
  //     p === oldPool ? updatedPool : p
  //   );
  //   this.poolsSubject.next(pools);
  //   this.saveToLocal(pools);
  // }

  // deletePool(pool: any) {
  //   const updated = this.poolsSubject.value.filter((p) => p !== pool);
  //   this.poolsSubject.next(updated);
  //   this.saveToLocal(updated);
  // }

  // private saveToLocal(pools: any[]) {
  //   if (this.isBrowser) {
  //     localStorage.setItem('pools', JSON.stringify(pools));
  //   }
  // }

 

  addPool(pool: any):Observable<any> {
    const url = environment.baseUrl + environment.endpoints.addPool.replace(':tournament_id', pool.tournamentId);
      return this.http.post(url, pool);
  }

  updatePool(oldPool: any, updatedPool: any) {
    return this.http.put(`/api/pools/${oldPool.id}`, updatedPool);
  }

  deletePool(pool: any) {
    return this.http.delete(`/api/pools/${pool.id}`);
  }
}
