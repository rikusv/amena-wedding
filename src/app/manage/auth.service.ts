import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user$: BehaviorSubject<User> = new BehaviorSubject(null);

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
  ) {
    this.afAuth.user.subscribe(user => {
      this.user$.next(user);
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
