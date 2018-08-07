import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageRoutingModule } from './manage-routing.module';
import { EditInvitationsComponent } from './edit-invitations/edit-invitations.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [
    CommonModule,
    ManageRoutingModule
  ],
  declarations: [EditInvitationsComponent, LoginComponent]
})
export class ManageModule { }
