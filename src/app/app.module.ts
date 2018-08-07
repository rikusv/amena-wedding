import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InvitationComponent } from './invitation/invitation.component';
import { LandingComponent } from './landing/landing.component';

import { InvitationResolverService } from './invitation-resolver.service';

@NgModule({
  declarations: [
    AppComponent,
    InvitationComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    FormsModule,
    NgbModule.forRoot(),
    AppRoutingModule
  ],
  providers: [InvitationResolverService],
  bootstrap: [AppComponent]
})
export class AppModule { }
