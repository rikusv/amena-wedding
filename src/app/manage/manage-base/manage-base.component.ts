import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';
import { MessageService } from '../../message.service';

@Component({
  selector: 'app-manage-base',
  templateUrl: './manage-base.component.html',
  styleUrls: ['./manage-base.component.css']
})
export class ManageBaseComponent implements OnInit {

  menuCollapsed = true;

  constructor(
    public authService: AuthService,
    public messageService: MessageService,
  ) { }

  ngOnInit() {
  }

}
