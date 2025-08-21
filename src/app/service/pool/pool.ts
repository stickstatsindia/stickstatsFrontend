import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PoolService {
  private poolsSubject = new BehaviorSubject<any[]>([]);
  pools$ = this.poolsSubject.asObservable();

  constructor() {}

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
