import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { fromEvent, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://localhost:3000'; // Replace with deployed URL later

  constructor() {
    this.socket = io(this.SERVER_URL);
  }

  emitScoreUpdate(data: any): void {
    this.socket.emit('scoreUpdate', data);
  }

  onScoreBroadcast(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('scoreBroadcast', (data) => observer.next(data));
    });
  }

  emitTimerUpdate(timerData: any) {
    this.socket.emit('timerUpdate', timerData);
  }

  onTimerUpdate(): Observable<any> {
    return fromEvent(this.socket, 'timerUpdate');
  }

  onScoreUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('scoreUpdate', (data) => {
        observer.next(data);
      });
    });
  }
}
