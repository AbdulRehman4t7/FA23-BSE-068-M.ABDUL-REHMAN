import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PaymentGridData } from '../../core/models/payment.model';

@Component({
  selector: 'app-payment-grid',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
            @for (month of months; track month) {
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">M{{ month }}</th>
            }
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          @for (row of data; track row.member_id) {
            <tr>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">{{ row.member_name }}</div>
                </div>
              </td>
              @for (month of months; track month) {
                <td class="px-4 py-3 text-center">
                  @if (row.payments[month]) {
                    <mat-icon [class]="getStatusClass(row.payments[month].status)" class="text-sm">
                      {{ getStatusIcon(row.payments[month].status) }}
                    </mat-icon>
                  } @else {
                    <span class="text-gray-300">-</span>
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class PaymentGridComponent {
  @Input() data: PaymentGridData[] = [];
  @Input() months: number[] = [];

  getStatusClass(status: string): string {
    return status === 'paid' ? 'text-green-600' : status === 'overdue' ? 'text-red-600' : 'text-yellow-600';
  }

  getStatusIcon(status: string): string {
    return status === 'paid' ? 'check_circle' : status === 'overdue' ? 'error' : 'schedule';
  }
}
