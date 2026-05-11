import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrencyPkrPipe } from '../../shared/pipes/currency-pkr.pipe';
import { CommitteeService } from '../../core/services/committee.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatTabsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, CurrencyPkrPipe],
  template: `
    <section class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="font-heading text-2xl">Dashboard</h1>
        <a mat-raised-button class="!bg-navy !text-white" routerLink="/committee/create">Create Committee</a>
      </div>

      <mat-tab-group>
        <mat-tab label="My Committees">
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            @for (committee of committeeService.myCommittees(); track committee.id) {
              <mat-card>
                <mat-card-content class="!p-4 space-y-2">
                  <h3 class="font-semibold">{{ committee.name }}</h3>
                  <p class="text-sm text-slate-500">{{ committee.monthly_amount | currencyPkr }} / month</p>
                  <p class="text-sm">Members: {{ committee.current_members_count }}/{{ committee.max_members }}</p>
                  <p class="text-sm">Status: <span class="font-medium">{{ committee.status }}</span></p>
                  <div class="flex gap-2">
                    <a mat-stroked-button [routerLink]="['/committee', committee.id]">View Details</a>
                    <a mat-button [routerLink]="['/committee', committee.id, 'payments']">Mark Payment</a>
                  </div>
                </mat-card-content>
              </mat-card>
            } @empty {
              <mat-card><mat-card-content class="!p-6 text-slate-500">No committees yet.</mat-card-content></mat-card>
            }
          </div>
        </mat-tab>
        <mat-tab label="Explore">
          <div class="grid md:grid-cols-4 gap-3 mt-4">
            <mat-form-field appearance="outline">
              <mat-label>Min Amount</mat-label>
              <input matInput type="number" #minAmount />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Max Amount</mat-label>
              <input matInput type="number" #maxAmount />
            </mat-form-field>
            <button mat-raised-button class="!bg-amber-500 !text-white h-14 mt-1" (click)="filter(minAmount.value, maxAmount.value)">Apply Filter</button>
          </div>
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-3">
            @for (committee of filteredPublic; track committee.id) {
              <mat-card>
                <mat-card-content class="!p-4">
                  <h3 class="font-semibold">{{ committee.name }}</h3>
                  <p class="text-sm">{{ committee.monthly_amount | currencyPkr }} · {{ committee.total_months }} months</p>
                  <p class="text-sm">Slots: {{ committee.current_members_count }}/{{ committee.max_members }}</p>
                  <button mat-raised-button color="primary" class="mt-3 !bg-navy" (click)="request(committee.id)">Request to Join</button>
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
  private readonly toastr = inject(ToastrService);
  filteredPublic = this.committeeService.publicCommittees();

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    await Promise.all([this.committeeService.loadMyCommittees(), this.committeeService.loadPublicCommittees()]);
    this.filteredPublic = this.committeeService.publicCommittees();
  }

  filter(min: string, max: string): void {
    const minAmount = Number(min || 0);
    const maxAmount = Number(max || Number.MAX_SAFE_INTEGER);
    this.filteredPublic = this.committeeService.publicCommittees().filter((c) => c.monthly_amount >= minAmount && c.monthly_amount <= maxAmount);
  }

  async request(committeeId: string): Promise<void> {
    try {
      await this.committeeService.requestToJoin(committeeId);
      this.toastr.success('Join request submitted');
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
