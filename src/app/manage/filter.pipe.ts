import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchResult: any[]): any {
    if (!items || !searchResult || !searchResult.length) {
      return items;
    }
    return items.filter(item => searchResult.indexOf(item.phone) !== -1);
  }

}
