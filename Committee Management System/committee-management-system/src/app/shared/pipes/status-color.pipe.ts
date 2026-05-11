import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: true
})
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'active':
      case 'paid':
      case 'approved':
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-amber-500';
      case 'overdue':
      case 'rejected':
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  }
}
