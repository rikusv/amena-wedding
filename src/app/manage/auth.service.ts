import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user$: Observable<User>;

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
  ) {
    this.user$ = this.afAuth.user;
    this.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/manage']);
      } else {
        this.router.navigate(['manage/login']);
      }
    });
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }
}
