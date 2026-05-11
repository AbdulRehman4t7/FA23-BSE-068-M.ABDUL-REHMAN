import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPkrPipe } from '../../shared/pipes/currency-pkr.pipe';
import { Committee } from '../../core/models/committee.model';
import { Payment } from '../../core/models/payment.model';
import { CommitteeService } from '../../core/services/committee.service';
import { PaymentService } from '../../core/services/payment.service';
import { PaymentGridComponent } from '../../shared/components/payment-grid.component';
import { ProgressStepperComponent } from '../../shared/components/progress-stepper.component';

@Component({
  selector: 'app-committee-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, MatCardModule, MatProgressBarModule, MatButtonModule, CurrencyPkrPipe, PaymentGridComponent, ProgressStepperComponent],
  template: `
    @if (committee) {
      <section class="space-y-4">
        <mat-card>
          <mat-card-content class="!p-5">
            <div class="flex flex-wrap justify-between gap-3">
              <div>
                <h1 class="font-heading text-2xl">{{ committee.name }}</h1>
                <p class="text-slate-500">{{ committee.start_date | date }} · {{ committee.monthly_amount | currencyPkr }}</p>
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
            <h2 class="font-semibold mb-3">Timeline</h2>
            <app-progress-stepper [currentMonth]="currentMonth" [monthOwners]="timelineMembers" />
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="!p-5">
            <h2 class="font-semibold mb-3">Payment Grid</h2>
            <app-payment-grid [payments]="payments" />
          </mat-card-content>
        </mat-card>

        <div class="flex gap-2">
          <a mat-stroked-button [routerLink]="['/committee', committee.id, 'members']">Manage Members</a>
          <a mat-raised-button class="!bg-navy !text-white" [routerLink]="['/committee', committee.id, 'payments']">Payment History</a>
        </div>
      </section>
    }
  `
})
export class CommitteeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly committeeService = inject(CommitteeService);
  private readonly paymentService = inject(PaymentService);

  committee: Committee | null = null;
  payments: Payment[] = [];
  currentMonth = 1;
  currentPayoutMember = 'TBD';
  nextPayoutMember = 'TBD';
  timelineMembers: string[] = [];

  constructor() {
    const committeeId = this.route.snapshot.paramMap.get('id');
    if (committeeId) {
      void this.load(committeeId);
    }
  }

  async load(committeeId: string): Promise<void> {
    this.committee = await this.committeeService.getCommitteeDetails(committeeId);
    this.payments = await this.paymentService.getCommitteePayments(committeeId);
    this.currentMonth = Math.min(this.committee.total_months, Math.max(1, this.payments.filter((p) => p.status === 'paid').length + 1));
    this.timelineMembers = Array.from({ length: this.committee.total_months }, (_, i) => `Member Slot ${i + 1}`);
    this.currentPayoutMember = this.timelineMembers[this.currentMonth - 1] ?? 'TBD';
    this.nextPayoutMember = this.timelineMembers[this.currentMonth] ?? 'N/A';
  }
}
