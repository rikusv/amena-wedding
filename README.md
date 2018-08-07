# Wedding RSVP App

This project consists of an [Angular](https://angular.io/) front-end, built with [Angular CLI](https://github.com/angular/angular-cli), and a [Cloud Firestore](https://firebase.google.com/docs/firestore/) backend, managed with [Firebase CLI](https://firebase.google.com/docs/cli/).

## Develop

Run `ng serve`. Make changes in `src/`. The app reloads automatically when changes are made.

Maintain Firestore rules in `firestore.rules`. Deploy rules with `firebase deploy --only firestore:rules`.

## Deploy

```
ng build --prod
firebase deploy
```

Test production build locally using `npm run prod`.
