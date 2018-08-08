import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { ManageRoutingModule } from './manage-routing.module';
import { EditInvitationsComponent } from './edit-invitations/edit-invitations.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';
import { FilterPipe } from './filter.pipe';
import { ConfirmOverwriteComponent } from './edit-invitations/confirm-overwrite/confirm-overwrite.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    AngularFireAuthModule,
    SharedModule,
    ManageRoutingModule
  ],
  declarations: [
    EditInvitationsComponent,
    LoginComponent,
    FilterPipe,
    ConfirmOverwriteComponent
  ],
  providers: [AuthService],
  entryComponents: [ConfirmOverwriteComponent]
})
export class ManageModule { }
