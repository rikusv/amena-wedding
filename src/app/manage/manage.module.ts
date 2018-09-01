import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { ManageRoutingModule } from './manage-routing.module';
import { EditInvitationsComponent } from './edit-invitations/edit-invitations.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';
import { FilterPipe } from './filter.pipe';
import { ConfirmOverwriteComponent } from './edit-invitations/confirm-overwrite/confirm-overwrite.component';
import { ManageBaseComponent } from './manage-base/manage-base.component';
import { InvitationStatsComponent } from './invitation-stats/invitation-stats.component';
import { EditInvitationComponent } from './edit-invitations/edit-invitation/edit-invitation.component';
import { EditInvitationResolverService } from './edit-invitation-resolver.service';
import { UploadInvitationsComponent } from './upload-invitations/upload-invitations.component';
import { ConfirmSentComponent } from './edit-invitations/confirm-sent/confirm-sent.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    AngularFireAuthModule,
    SharedModule,
    ManageRoutingModule
  ],
  declarations: [
    EditInvitationsComponent,
    LoginComponent,
    FilterPipe,
    ConfirmOverwriteComponent,
    ManageBaseComponent,
    InvitationStatsComponent,
    EditInvitationComponent,
    UploadInvitationsComponent,
    ConfirmSentComponent
  ],
  providers: [
    AuthService,
    EditInvitationResolverService
  ],
  entryComponents: [
    ConfirmOverwriteComponent,
    EditInvitationComponent,
    ConfirmSentComponent
  ]
})
export class ManageModule { }
