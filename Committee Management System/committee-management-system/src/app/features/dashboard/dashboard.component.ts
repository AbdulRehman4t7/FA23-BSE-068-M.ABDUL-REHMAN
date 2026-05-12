import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyPkrPipe } from '../../shared/pipes/currency-pkr.pipe';
import { CommitteeService } from '../../core/services/committee.service';
import { PaymentService } from '../../core/services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { CommitteeWithMeta } from '../../core/models/committee.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatTabsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyPkrPipe],
  template: `
    <section class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="font-heading text-2xl">Dashboard</h1>
        <a mat-raised-button class="!bg-navy !text-white" routerLink="/committee/create">Create Committee</a>
      </div>

      @if (loading) {
        <div class="grid md:grid-cols-3 gap-4 animate-pulse">
          <div class="h-40 rounded-xl bg-slate-200"></div>
          <div class="h-40 rounded-xl bg-slate-200"></div>
          <div class="h-40 rounded-xl bg-slate-200"></div>
        </div>
      }

      <mat-tab-group>
        <mat-tab label="My Committees">
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            @for (committee of committeeService.myCommittees(); track committee.id) {
              <mat-card>
                <mat-card-content class="!p-4 space-y-2">
                  <h3 class="font-semibold">{{ committee.name }}</h3>
                  <p class="text-sm text-slate-500">{{ committee.monthly_amount | currencyPkr }} / month</p>
                  <p class="text-sm">Members: {{ committee.current_members_count }}/{{ committee.max_members }}</p>
                  <p class="text-sm">Current month: {{ currentMonth(committee) }}</p>
                  <p class="text-sm">My turn: {{ committee.user_membership?.turn_month ?? '-' }}</p>
                  <p class="text-sm">Status: <span class="font-medium">{{ committee.status }}</span></p>
                  <div class="flex gap-2 flex-wrap">
                    <a mat-stroked-button [routerLink]="['/committee', committee.id]">View Details</a>
                    <a mat-button [routerLink]="['/committee', committee.id, 'payments']">Mark Payment</a>
                    <button mat-button class="!text-amber-600" (click)="sendReminder(committee)">Send Reminder</button>
                  </div>
                </mat-card-content>
              </mat-card>
            } @empty {
              <mat-card><mat-card-content class="!p-6 text-slate-500">No committees yet.</mat-card-content></mat-card>
            }
          </div>
        </mat-tab>
        <mat-tab label="Explore">
          <form class="grid md:grid-cols-5 gap-3 mt-4" [formGroup]="filtersForm" (ngSubmit)="applyExploreFilter()">
            <mat-form-field appearance="outline">
              <mat-label>Min Amount</mat-label>
              <input matInput type="number" formControlName="minAmount" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Max Amount</mat-label>
              <input matInput type="number" formControlName="maxAmount" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Duration (months)</mat-label>
              <mat-select formControlName="duration">
                <mat-option [value]="null">Any</mat-option>
                <mat-option [value]="6">6</mat-option>
                <mat-option [value]="10">10</mat-option>
                <mat-option [value]="12">12</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Min slots available</mat-label>
              <input matInput type="number" formControlName="slotsAvailable" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Creator rating min</mat-label>
              <input matInput type="number" formControlName="creatorRating" min="0" max="5" step="0.1" />
            </mat-form-field>
            <button mat-raised-button class="!bg-amber-500 !text-white h-14 mt-1 md:col-span-5">Apply Filters</button>
          </form>

          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-3">
            @for (committee of committeeService.publicCommittees(); track committee.id) {
              <mat-card>
                <mat-card-content class="!p-4 space-y-2">
                  <h3 class="font-semibold">{{ committee.name }}</h3>
                  <p class="text-sm">{{ committee.monthly_amount | currencyPkr }} · {{ committee.total_months }} months</p>
                  <p class="text-sm">Slots: {{ committee.current_members_count }}/{{ committee.max_members }}</p>
                  <p class="text-sm">
                    Creator: {{ committee.creator_profile?.full_name || 'Unknown' }}
                    · ★{{ committee.creator_profile?.reputation_score ?? 0 }}
                    · {{ committee.creator_profile?.badge || 'new' }}
                  </p>
                  <button mat-raised-button color="primary" class="mt-1 !bg-navy" (click)="request(committee.id)">Request to Join</button>
                </mat-card-content>
              </mat-card>
            } @empty {
              <mat-card><mat-card-content class="!p-6 text-slate-500">No public committees available.</mat-card-content></mat-card>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </section>
  `
})
export class DashboardComponent {
  readonly committeeService = inject(CommitteeService);
  private readonly paymentService = inject(PaymentService);
  private readonly toastr = inject(ToastrService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  loading = true;

  readonly filtersForm = this.fb.group({
    minAmount: [null as number | null],
    maxAmount: [null as number | null],
    duration: [null as number | null],
    slotsAvailable: [null as number | null],
    creatorRating: [null as number | null]
  });

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    await Promise.all([this.committeeService.loadMyCommittees(), this.committeeService.loadPublicCommittees()]);
    this.loading = false;
  }

  currentMonth(committee: CommitteeWithMeta): number {
    const now = new Date();
    const start = new Date(committee.start_date);
    if (Number.isNaN(start.getTime()) || now < start) return 1;
    const months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth() + 1;
    return Math.min(committee.total_months, Math.max(1, months));
  }

  async applyExploreFilter(): Promise<void> {
    const form = this.filtersForm.getRawValue();
    await this.committeeService.loadPublicCommittees({
      minAmount: form.minAmount ?? undefined,
      maxAmount: form.maxAmount ?? undefined,
      duration: form.duration ?? undefined,
      slotsAtLeast: form.slotsAvailable ?? undefined,
      minCreatorReputation: form.creatorRating ?? undefined
    });
  }

  async request(committeeId: string): Promise<void> {
    try {
      await this.committeeService.requestToJoin(committeeId);
      this.toastr.success('Join request submitted');
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }

  async sendReminder(committee: CommitteeWithMeta): Promise<void> {
    try {
      const currentUserId = this.auth.user()?.id;
      const members = await this.committeeService.getMembers(committee.id);
      const receivers = members.filter((member) => member.user_id !== currentUserId && member.status === 'active');
      await Promise.all(
        receivers.map((member) =>
          this.paymentService.sendPaymentReminder({
            userId: member.user_id,
            committeeId: committee.id,
            committeeName: committee.name,
            monthNumber: this.currentMonth(committee)
          })
        )
      );
      this.toastr.info('Reminder sent');
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
