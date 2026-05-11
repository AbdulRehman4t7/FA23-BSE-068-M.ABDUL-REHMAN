import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Payment } from '../../core/models/payment.model';

@Component({
  selector: 'app-payment-grid',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
      @for (payment of payments; track payment.id) {
        <div class="rounded-md p-2 text-center text-xs font-semibold"
             [ngClass]="{
               'bg-green-100 text-green-700': payment.status === 'paid',
               'bg-amber-100 text-amber-700': payment.status === 'pending',
               'bg-red-100 text-red-700': payment.status === 'overdue'
             }">
          M{{ payment.month_number }} {{ payment.status === 'paid' ? '✅' : payment.status === 'pending' ? '⏳' : '❌' }}
        </div>
      }
    </div>
  `
})
export class PaymentGridComponent {
  @Input() payments: Payment[] = [];
}
