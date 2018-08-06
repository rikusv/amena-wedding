import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  phone: number;
  state: 'inputErrors' | 'loading' | 'notFound' | '';
  notFoundPhone: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(data => {
      this.state = data.get('notFound') === 'true' ? 'notFound' : '';
      this.notFoundPhone = Number(data.get('phone'));
    });
    window.addEventListener('load', function() {
      const forms = document.getElementsByClassName('needs-validation');
      const validation = Array.prototype.filter.call(forms, form => {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    }, false);
  }

  fetchInvitation(input: NgModel) {
    if (input.invalid) {
      this.state = 'inputErrors';
    } else {
      const path = `/invitation/${this.phone}`;
      this.state = 'loading';
      this.router.navigate([path]);
    }
  }

}
