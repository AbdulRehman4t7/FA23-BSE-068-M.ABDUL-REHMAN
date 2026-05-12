import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentGridData } from '../../core/models/payment.model';
import { CurrencyPkrPipe } from '../../shared/pipes/currency-pkr.pipe';

@Component({
  selector: 'app-committee-payments',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, CurrencyPkrPipe],
  template: `
    <div class="max-w-7xl mx-auto py-8">
      <h1 class="text-3xl font-bold mb-6">Payment Grid</h1>
      <mat-card>
        @if (paymentGrid().length === 0) {
          <div class="text-center py-12">
            <mat-icon class="text-6xl text-gray-400">payment</mat-icon>
            <p class="text-gray-600 mt-4">No payment data available</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="p-2 text-left">Member</th>
                  @for (month of getMonths(); track month) {
                    <th class="p-2 text-center">M{{ month }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of paymentGrid(); track row.member_id) {
                  <tr class="border-b">
                    <td class="p-2">{{ row.member_name }}</td>
                    @for (month of getMonths(); track month) {
                      <td class="p-2 text-center">
                        @if (row.payments[month]) {
                          <span [class]="getStatusClass(row.payments[month].status)">
                            {{ getStatusIcon(row.payments[month].status) }}
                          </span>
                        } @else {
                          <span class="text-gray-400">-</span>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </mat-card>
    </div>
  `
})
export class CommitteePaymentsComponent implements OnInit {
  paymentGrid = signal<PaymentGridData[]>([]);

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const grid = await this.paymentService.getPaymentGridData(id);
      this.paymentGrid.set(grid);
    }
  }

  getMonths(): number[] {
    const grid = this.paymentGrid();
    if (grid.length === 0) return [];
    const firstMember = grid[0];
    return Object.keys(firstMember.payments).map(Number).sort((a, b) => a - b);
  }

  getStatusClass(status: string): string {
    return status === 'paid' ? 'text-green-600' : status === 'overdue' ? 'text-red-600' : 'text-yellow-600';
  }

  getStatusIcon(status: string): string {
    return status === 'paid' ? '✓' : status === 'overdue' ? '✗' : '○';
  }
}
