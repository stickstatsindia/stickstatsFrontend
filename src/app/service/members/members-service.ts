import { Injectable } from '@angular/core';
import { environment } from '../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  constructor(private http:HttpClient) { }
    addMemberUrl: string = environment.baseUrl + environment.endpoints.addplayer;
    getMembersUrl: string = environment.baseUrl + environment.endpoints.getPlayersByTeamId;
    getAllMatchesUrl: string = environment.baseUrl + environment.endpoints.getALlMatches;
    addMember(memberData: any): Observable<any> {
      // Replace :team_id in the URL with the actual teamId from memberData
      const url = this.addMemberUrl.replace(':team_id', memberData.teamId);
      return this.http.post(url, memberData);
    }

    getMembers(teamId: string): Observable<any> {
      // Replace :team_id in the URL with the actual teamId
      const url = this.getMembersUrl.replace(':team_id', teamId);
      return this.http.get(url);
    }

    getAllMatches():Observable<any>{
      return this.http.get(this.getAllMatchesUrl);
    }

    removeMember(teamId: string, member: { user_id?: string; _id?: string; phone_number?: string; team_id?: string } | string): Observable<any> {
      const userId = typeof member === 'string' ? member : (member?.user_id || '');
      const memberId = typeof member === 'string' ? '' : (member?._id || '');
      const phoneNumber = typeof member === 'string' ? '' : (member?.phone_number || '');
      const memberTeamId = typeof member === 'string' ? '' : (member?.team_id || '');
      const teamIds = Array.from(new Set([teamId, memberTeamId].filter(Boolean))) as string[];
      const idCandidates = [memberId, userId].filter(Boolean) as string[];

      const collectionUrls = teamIds.flatMap((id) => ([
        `${environment.baseUrl}/api/teams/${id}/members`,
        `${environment.baseUrl}/api/team/${id}/members`,
        `${environment.baseUrl}/api/teams/${id}/member`,
        `${environment.baseUrl}/api/team/${id}/member`
      ]));

      const resourceUrls = teamIds.flatMap((tId) =>
        idCandidates.flatMap((id) => ([
          `${environment.baseUrl}/api/teams/${tId}/members/${id}`,
          `${environment.baseUrl}/api/team/${tId}/members/${id}`,
          `${environment.baseUrl}/api/teams/${tId}/member/${id}`,
          `${environment.baseUrl}/api/team/${tId}/member/${id}`,
          `${environment.baseUrl}/api/teams/${tId}/remove-member/${id}`,
          `${environment.baseUrl}/api/team/${tId}/remove-member/${id}`
        ]))
      );

      const globalMemberUrls = idCandidates.flatMap((id) => ([
        `${environment.baseUrl}/api/members/${id}`,
        `${environment.baseUrl}/api/member/${id}`,
        `${environment.baseUrl}/api/team-members/${id}`
      ]));

      const body = {
        user_id: userId || undefined,
        userId: userId || undefined,
        member_id: memberId || undefined,
        memberId: memberId || undefined,
        phone_number: phoneNumber || undefined
      };

      const operations: Array<() => Observable<any>> = [];

      collectionUrls.forEach((url) => {
        operations.push(() => this.http.request('DELETE', url, { body, responseType: 'text' }));
      });

      resourceUrls.forEach((url) => {
        operations.push(() => this.http.request('DELETE', url, { responseType: 'text' }));
      });

      collectionUrls.forEach((url) => {
        if (userId) operations.push(() => this.http.request('DELETE', `${url}?user_id=${encodeURIComponent(userId)}`, { responseType: 'text' }));
        if (memberId) operations.push(() => this.http.request('DELETE', `${url}?member_id=${encodeURIComponent(memberId)}`, { responseType: 'text' }));
        if (userId) operations.push(() => this.http.request('DELETE', `${url}?userId=${encodeURIComponent(userId)}`, { responseType: 'text' }));
        if (memberId) operations.push(() => this.http.request('DELETE', `${url}?memberId=${encodeURIComponent(memberId)}`, { responseType: 'text' }));
      });

      collectionUrls.forEach((url) => {
        operations.push(() => this.http.post(`${url}/remove`, body, { responseType: 'text' }));
        operations.push(() => this.http.post(`${url}/remove-member`, body, { responseType: 'text' }));
      });

      const actionUrls = teamIds.flatMap((id) => ([
        `${environment.baseUrl}/api/teams/${id}/remove-member`,
        `${environment.baseUrl}/api/team/${id}/remove-member`
      ]));

      actionUrls.forEach((url) => {
        operations.push(() => this.http.post(url, body, { responseType: 'text' }));
      });

      globalMemberUrls.forEach((url) => {
        operations.push(() => this.http.request('DELETE', url, { responseType: 'text' }));
      });

      return this.runFallbackOperations(operations);
    }

    private runFallbackOperations(operations: Array<() => Observable<any>>): Observable<any> {
      const [currentOperation, ...rest] = operations;
      if (!currentOperation) {
        return throwError(() => new Error('No delete endpoint available for removing member.'));
      }

      return currentOperation().pipe(
        catchError((err) => {
          if (!rest.length) return throwError(() => err);
          return this.runFallbackOperations(rest);
        })
      );
    }

}
