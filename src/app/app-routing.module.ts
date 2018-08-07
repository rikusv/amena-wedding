import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingComponent } from './landing/landing.component';
import { InvitationComponent } from './invitation/invitation.component';

import { InvitationResolverService } from './invitation-resolver.service';

const appRoutes: Routes = [
  {
    path: 'invitation/:phone',
    component: InvitationComponent,
    resolve: {
      invitation: InvitationResolverService
    }
  },
  {
    path: 'manage',
    loadChildren: './manage/manage.module#ManageModule'
  },
  {
    path: '',
    component: LandingComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
