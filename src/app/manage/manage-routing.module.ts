import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageBaseComponent } from './manage-base/manage-base.component';
import { LoginComponent } from './login/login.component';
import { EditInvitationsComponent } from './edit-invitations/edit-invitations.component';
import { EditInvitationComponent } from './edit-invitations/edit-invitation/edit-invitation.component';
import { InvitationStatsComponent } from './invitation-stats/invitation-stats.component';
import { UploadInvitationsComponent } from './upload-invitations/upload-invitations.component';

import { EditInvitationResolverService } from './edit-invitation-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: ManageBaseComponent,
    children: [
      {
        path: 'edit',
        children: [
          {
            path: '',
            component: EditInvitationsComponent
          },
          {
            path: ':invitation',
            component: EditInvitationComponent,
            canDeactivate: [],
            resolve: {
              invitation: EditInvitationResolverService
            }
          }
        ]
      },
      {
        path: 'upload',
        component: UploadInvitationsComponent
      },
      {
        path: 'stats',
        component: InvitationStatsComponent
      },
      {
        path: '',
        redirectTo: 'edit',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoutingModule { }
