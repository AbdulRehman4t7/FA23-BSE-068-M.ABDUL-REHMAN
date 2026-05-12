import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPkr',
  standalone: true
})
export class CurrencyPkrPipe implements PipeTransform {
  transform(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num)) return 'PKR 0';
    
    return `PKR ${num.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  }
}
