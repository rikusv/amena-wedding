import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageBaseComponent } from './manage-base/manage-base.component';
import { LoginComponent } from './login/login.component';
import { EditInvitationsComponent } from './edit-invitations/edit-invitations.component';
import { InvitationStatsComponent } from './invitation-stats/invitation-stats.component';

const routes: Routes = [
  {
    path: '',
    component: ManageBaseComponent,
    children: [
      {
        path: 'edit',
        component: EditInvitationsComponent
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
