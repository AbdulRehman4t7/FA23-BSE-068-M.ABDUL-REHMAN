import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { CommitteeService } from '../../core/services/committee.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-create-committee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="max-w-3xl mx-auto py-8">
      <mat-card>
        <mat-card-header class="mb-6">
          <mat-card-title class="text-2xl">Create New Committee</mat-card-title>
          <mat-card-subtitle>Set up a rotating savings committee</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="committeeForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Committee Name</mat-label>
              <input matInput formControlName="name" placeholder="Monthly Savings Committee">
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" 
                        placeholder="Describe the purpose and rules of this committee"></textarea>
            </mat-form-field>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Monthly Amount (PKR)</mat-label>
                <input matInput type="number" formControlName="monthly_amount" placeholder="50000">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Duration (Months)</mat-label>
                <mat-select formControlName="total_months">
                  <mat-option [value]="6">6 months</mat-option>
                  <mat-option [value]="10">10 months</mat-option>
                  <mat-option [value]="12">12 months</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Maximum Members</mat-label>
                <mat-select formControlName="max_members">
                  @for (num of [2,3,4,5,6,7,8,9,10]; track num) {
                    <mat-option [value]="num">{{ num }} members</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Your Turn Month</mat-label>
                <mat-select formControlName="creator_turn_month">
                  @for (month of getMonthOptions(); track month) {
                    <mat-option [value]="month">Month {{ month }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="start_date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Payment Methods</label>
              <div class="space-y-2">
                <mat-checkbox formControlName="payment_bank">Bank Transfer</mat-checkbox>
                <mat-checkbox formControlName="payment_jazzcash">JazzCash</mat-checkbox>
                <mat-checkbox formControlName="payment_easypaisa">Easypaisa</mat-checkbox>
              </div>
            </div>

            <mat-checkbox formControlName="is_public">
              Make this committee public (visible in Explore)
            </mat-checkbox>

            <div class="flex justify-end gap-2 pt-4">
              <button mat-button type="button" routerLink="/dashboard">Cancel</button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="loading() || committeeForm.invalid">
                @if (loading()) {
                  <span class="animate-spin">⟳</span>
                }
                Create Committee
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class CreateCommitteeComponent {
  committeeForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private committeeService: CommitteeService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.committeeForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      monthly_amount: ['', [Validators.required, Validators.min(1000)]],
      total_months: [6, Validators.required],
      max_members: [6, Validators.required],
      creator_turn_month: [1, Validators.required],
      start_date: ['', Validators.required],
      payment_bank: [true],
      payment_jazzcash: [false],
      payment_easypaisa: [false],
      is_public: [true]
    });
  }

  getMonthOptions(): number[] {
    const totalMonths = this.committeeForm.get('total_months')?.value || 6;
    return Array.from({ length: totalMonths }, (_, i) => i + 1);
  }

  async onSubmit() {
    if (this.committeeForm.invalid) return;

    const userId = this.authService.getUserId();
    if (!userId) return;

    const paymentMethods: string[] = [];
    if (this.committeeForm.value.payment_bank) paymentMethods.push('bank');
    if (this.committeeForm.value.payment_jazzcash) paymentMethods.push('jazzcash');
    if (this.committeeForm.value.payment_easypaisa) paymentMethods.push('easypaisa');

    if (paymentMethods.length === 0) {
      this.toastr.error('Select at least one payment method', 'Error');
      return;
    }

    this.loading.set(true);
    try {
      const data = {
        name: this.committeeForm.value.name,
        description: this.committeeForm.value.description,
        monthly_amount: this.committeeForm.value.monthly_amount,
        total_months: this.committeeForm.value.total_months,
        max_members: this.committeeForm.value.max_members,
        creator_turn_month: this.committeeForm.value.creator_turn_month,
        start_date: new Date(this.committeeForm.value.start_date).toISOString().split('T')[0],
        is_public: this.committeeForm.value.is_public,
        payment_methods: paymentMethods as any
      };

      const committee = await this.committeeService.createCommittee(data, userId);
      this.toastr.success('Committee created successfully', 'Success');
      this.router.navigate(['/committee', committee.id]);
    } catch (error: any) {
      this.toastr.error(error.message || 'Failed to create committee', 'Error');
    } finally {
      this.loading.set(false);
    }
  }
}
