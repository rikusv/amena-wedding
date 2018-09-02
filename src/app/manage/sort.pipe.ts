import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {


  transform(items: any[], sorter: {property: string, ascending?: boolean}): any {
    function score(invitation: any, eventId: string) {
      return invitation.rsvp[eventId] === '' || typeof invitation.rsvp[eventId] === 'undefined' ?
      0 : (invitation.rsvp[eventId] < invitation.events[eventId] ? 2 : 1);
    }
    if (!items || !sorter || !sorter.property) {
      return items;
    }
    const parts = sorter.property.split('/');
    if (parts.length === 1) { // direct field sort
      const type = typeof items[0][sorter.property];
      switch (type) {
        case 'boolean':
          return items.sort((a, b) => a[sorter.property] ?
          (sorter.ascending ? 1 : -1) : (sorter.ascending ? -1 : 1));
        case 'string':
          return items.sort((a, b) => a[sorter.property] < b[sorter.property] ?
          (sorter.ascending ? -1 : 1) : (sorter.ascending ? 1 : -1));
        default:
          return items;
      }
    } else if (parts[0] === 'rsvp') {

      const eventId = parts[1];
      return items.sort((a, b) => {
        const aScore = score(a, eventId);
        const bScore = score(b, eventId);
        return sorter.ascending ?
        (aScore >= bScore ? -1 : 1) : (aScore >= bScore ? 1 : -1);
      });
    } else { // don't know how to sort
      return items;
    }

  }

}
