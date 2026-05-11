import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPkr',
  standalone: true
})
export class CurrencyPkrPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const amount = value ?? 0;
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
