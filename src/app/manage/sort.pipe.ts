import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {


  transform(items: any[], sorter: {property: string, ascending?: boolean}): any {
    if (!items || !sorter || !sorter.property) {
      return items;
    }
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
  }

}
