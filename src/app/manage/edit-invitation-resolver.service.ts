import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ManageInvitationService } from './manage-invitation.service';
import { DbInvitation } from '../db-invitation';

@Injectable({
  providedIn: 'root'
})
export class EditInvitationResolverService implements Resolve<DbInvitation> {

  constructor(
    private manageInvitationService: ManageInvitationService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DbInvitation> {
    const key = route.paramMap.get('invitation');
    return this.manageInvitationService.getInvitation$(key).pipe(
      take(1),
      map(invitation => {
        if (invitation) {
          return invitation;
        } else {
          this.router.navigate(['/manage']);
          return null;
        }
      })
    );
  }

}
