import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { InvitationService } from './invitation.service';
import { Invitation } from './invitation';

  @Injectable({
    providedIn: 'root'
  })
  export class InvitationResolverService implements Resolve<Invitation> {

    constructor(
      private invitationService: InvitationService,
      private router: Router
    ) { }

    resolve(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<Invitation> {

      const phone = Number(route.paramMap.get('phone'));

      return this.invitationService.getInvitation(phone).pipe(
        take(1),
        map(invitation => {
          if (invitation) {
            return invitation;
          } else {
            this.router.navigate(['/'], {queryParams: {notFound: true, phone: phone}});
            return null;
          }
        })
      );
    }
  }
