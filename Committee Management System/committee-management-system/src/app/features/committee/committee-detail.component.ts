import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPkrPipe } from '../../shared/pipes/currency-pkr.pipe';
import { CommitteeMemberWithProfile, CommitteeWithMeta } from '../../core/models/committee.model';
import { Payment } from '../../core/models/payment.model';
import { CommitteeService } from '../../core/services/committee.service';
import { PaymentService } from '../../core/services/payment.service';
import { ProgressStepperComponent } from '../../shared/components/progress-stepper.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-committee-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatProgressBarModule, MatButtonModule, CurrencyPkrPipe, ProgressStepperComponent],
  template: `
    @if (loading) {
      <div class="space-y-3 animate-pulse">
        <div class="h-28 rounded-xl bg-slate-200"></div>
        <div class="h-28 rounded-xl bg-slate-200"></div>
      </div>
    }
    @if (committee) {
      <section class="space-y-4">
        <mat-card>
          <mat-card-content class="!p-5">
            <div class="flex flex-wrap justify-between gap-3">
              <div>
                <h1 class="font-heading text-2xl">{{ committee.name }}</h1>
                <p class="text-slate-500">
                  {{ committee.start_date | date }} - {{ endDate(committee.start_date, committee.total_months) | date }}
                  · {{ committee.monthly_amount | currencyPkr }}
                </p>
              </div>
              <span class="px-3 py-1 rounded-full bg-slate-100">{{ committee.status }}</span>
            </div>
            <div class="mt-3">
              <p class="text-sm mb-1">Month {{ currentMonth }} of {{ committee.total_months }}</p>
              <mat-progress-bar mode="determinate" [value]="(currentMonth / committee.total_months) * 100"></mat-progress-bar>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="!p-5">
            <h2 class="font-semibold mb-2">WHO GETS PAID THIS MONTH</h2>
            <p class="text-amber-600 font-semibold">{{ currentPayoutMember }}</p>
            <p class="text-sm text-slate-500 mt-2">Next month: {{ nextPayoutMember }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="!p-5">
            <h2 class="font-semibold mb-3">Committee timeline</h2>
            <app-progress-stepper [currentMonth]="currentMonth" [monthOwners]="timelineMembers" />
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="!p-5 overflow-x-auto">
            <h2 class="font-semibold mb-3">Member payment grid</h2>
            <table class="min-w-full text-sm border">
              <thead>
                <tr class="bg-slate-100">
                  <th class="p-2 border">Slot #</th>
                  <th class="p-2 border">Name</th>
                  <th class="p-2 border">Turn</th>
                  @for (month of monthColumns; track month) {
                    <th class="p-2 border" [class.bg-amber-100]="month === currentMonth">{{ monthLabel(month) }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (member of members; track member.id) {
                  <tr>
                    <td class="p-2 border">{{ member.slot_number }}</td>
                    <td class="p-2 border">{{ member.profile?.full_name || member.user_id }}</td>
                    <td class="p-2 border">{{ member.turn_month }}</td>
                    @for (month of monthColumns; track month) {
                      <td class="p-2 border text-center">
                        {{ paymentIndicator(member.user_id, month) }}
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="!p-5">
            <h2 class="font-semibold mb-3">Payment history log</h2>
            @for (payment of payments; track payment.id) {
              <div class="border rounded p-3 mb-2">
                <p class="font-medium">Month {{ payment.month_number }} · {{ payment.status }}</p>
                <p class="text-sm text-slate-600">
                  Amount {{ payment.amount | currencyPkr }} · Method {{ payment.method || '-' }} · Ref {{ payment.transaction_reference || '-' }}
                </p>
                @if (payment.notes) {
                  <p class="text-xs text-slate-500 mt-1">Notes: {{ payment.notes }}</p>
                }
              </div>
            } @empty {
              <p class="text-slate-500">No payment history yet.</p>
            }
          </mat-card-content>
        </mat-card>

        <div class="flex gap-2 flex-wrap">
          <a mat-stroked-button [routerLink]="['/committee', committee.id, 'members']">Manage Members</a>
          <a mat-raised-button class="!bg-navy !text-white" [routerLink]="['/committee', committee.id, 'payments']">Manage Payments</a>
          @if (canCancel()) {
            <button mat-button class="!text-red-600" (click)="cancelCommittee()">Cancel Before Activation</button>
          }
        </div>
      </section>
    }
  `
})
export class CommitteeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly committeeService = inject(CommitteeService);
  private readonly paymentService = inject(PaymentService);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  committee: CommitteeWithMeta | null = null;
  members: CommitteeMemberWithProfile[] = [];
  payments: Payment[] = [];
  currentMonth = 1;
  currentPayoutMember = 'TBD';
  nextPayoutMember = 'TBD';
  timelineMembers: string[] = [];
  monthColumns: number[] = [];
  loading = true;

  constructor() {
    const committeeId = this.route.snapshot.paramMap.get('id');
    if (committeeId) void this.load(committeeId);
  }

  async load(committeeId: string): Promise<void> {
    this.loading = true;
    this.committee = await this.committeeService.getCommitteeDetails(committeeId);
    this.members = await this.committeeService.getMembers(committeeId);
    await this.paymentService.ensurePaymentGridRows(committeeId, this.committee.total_months);
    this.payments = await this.paymentService.getCommitteePayments(committeeId);

    this.currentMonth = this.getCurrentMonth(this.committee.start_date, this.committee.total_months);
    this.monthColumns = Array.from({ length: this.committee.total_months }, (_, i) => i + 1);

    const sortedByTurn = [...this.members].sort((a, b) => a.turn_month - b.turn_month);
    this.timelineMembers = this.monthColumns.map((month) => {
      const owner = sortedByTurn.find((member) => member.turn_month === month);
      return owner?.profile?.full_name ?? `Slot ${month}`;
    });

    this.currentPayoutMember = this.timelineMembers[this.currentMonth - 1] ?? 'TBD';
    this.nextPayoutMember = this.timelineMembers[this.currentMonth] ?? 'N/A';
    this.loading = false;
  }

  paymentIndicator(memberId: string, month: number): string {
    const payment = this.payments.find((item) => item.member_id === memberId && item.month_number === month);
    if (!payment) return '⏳';
    if (payment.status === 'paid') return '✅';
    if (payment.status === 'overdue') return '❌';
    return '⏳';
  }

  private getCurrentMonth(startDate: string, totalMonths: number): number {
    const start = new Date(startDate);
    const now = new Date();
    if (Number.isNaN(start.getTime()) || now < start) return 1;
    const monthDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
    return Math.max(1, Math.min(totalMonths, monthDiff));
  }

  endDate(startDate: string, totalMonths: number): string {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + totalMonths - 1);
    return date.toISOString();
  }

  monthLabel(month: number): string {
    if (!this.committee) return `M${month}`;
    const date = new Date(this.committee.start_date);
    date.setMonth(date.getMonth() + month - 1);
    return date.toLocaleString('en-US', { month: 'short' });
  }

  canCancel(): boolean {
    return !!this.committee && this.committee.status === 'pending' && this.committee.creator_id === this.auth.user()?.id;
  }

  async cancelCommittee(): Promise<void> {
    if (!this.committee) return;
    try {
      await this.committeeService.cancelCommittee(this.committee.id);
      this.toastr.info('Committee cancelled');
      await this.load(this.committee.id);
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
