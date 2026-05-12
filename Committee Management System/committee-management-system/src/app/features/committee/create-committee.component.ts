import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { CommitteeService } from '../../core/services/committee.service';

@Component({
  selector: 'app-create-committee',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCheckboxModule],
  template: `
    <mat-card>
      <mat-card-content class="!p-6">
        <h1 class="font-heading text-2xl mb-4">Create Committee</h1>
        <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-3" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Committee Name</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="md:col-span-2">
            <mat-label>Description</mat-label>
            <textarea matInput rows="3" formControlName="description"></textarea>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Total months</mat-label>
            <input matInput type="number" formControlName="total_months" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Monthly contribution (PKR)</mat-label>
            <input matInput type="number" formControlName="monthly_amount" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Maximum members</mat-label>
            <input matInput type="number" formControlName="max_members" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Start date</mat-label>
            <input matInput type="date" formControlName="start_date" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Creator turn month</mat-label>
            <input matInput type="number" formControlName="creator_turn_month" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Payment methods</mat-label>
            <mat-select formControlName="payment_methods" multiple>
              <mat-option value="bank">Bank Transfer</mat-option>
              <mat-option value="jazzcash">JazzCash</mat-option>
              <mat-option value="easypaisa">Easypaisa</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-checkbox formControlName="is_public" class="md:col-span-2">Public committee (shown in Explore)</mat-checkbox>
          <button mat-raised-button color="primary" class="md:col-span-2 !bg-navy" [disabled]="form.invalid">Create Committee</button>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class CreateCommitteeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly committeeService = inject(CommitteeService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    total_months: [6, [Validators.required, Validators.min(2)]],
    monthly_amount: [5000, [Validators.required, Validators.min(1)]],
    max_members: [6, [Validators.required, Validators.min(2), Validators.max(10)]],
    start_date: ['', Validators.required],
    payment_methods: this.fb.nonNullable.control<Array<'bank' | 'jazzcash' | 'easypaisa'>>(['bank']),
    is_public: [true],
    creator_turn_month: [1, [Validators.required, Validators.min(1)]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    try {
      const { creator_turn_month, ...payload } = this.form.getRawValue();
      if (!payload.payment_methods.length) {
        this.toastr.error('Please select at least one payment method');
        return;
      }
      const committee = await this.committeeService.createCommittee(payload, creator_turn_month);
      this.toastr.success('Committee created');
      await this.router.navigate(['/committee', committee.id]);
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
