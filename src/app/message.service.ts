import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Message } from './message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  public messages$: Subject<Message[]> = new Subject();
  messages: Message[] = [];

  constructor() { }

  sendMessage(message: Message) {
    this.messages.unshift(message);
    this.messages$.next(this.messages);
    setTimeout(() => this.messages.pop(), 2000);
  }

}
