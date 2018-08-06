import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { InvitationComponent } from './invitation/invitation.component';
import { LandingComponent } from './landing/landing.component';

import { InvitationResolverService } from './invitation-resolver.service';

const appRoutes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'invitation/:phone',
    component: InvitationComponent,
    resolve: {
      invitation: InvitationResolverService
    }
  }
];

@NgModule({
  declarations: [
    AppComponent,
    InvitationComponent,
    LandingComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    FormsModule,
    NgbModule.forRoot()
  ],
  providers: [InvitationResolverService],
  bootstrap: [AppComponent]
})
export class AppModule { }
