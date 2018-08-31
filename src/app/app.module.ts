import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { PapaParseModule } from 'ngx-papaparse';

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
    PapaParseModule,
    BrowserModule,
    FormsModule,
    NgbModule.forRoot(),
    SharedModule,
    AppRoutingModule
  ],
  providers: [InvitationResolverService],
  bootstrap: [AppComponent]
})
export class AppModule { }
