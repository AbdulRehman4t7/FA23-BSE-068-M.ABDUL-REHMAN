import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../core/services/payment.service';
import { Payment } from '../../core/models/payment.model';

@Component({
  selector: 'app-committee-payments',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatTableModule],
  template: `
    <div class="space-y-4">
      <mat-card>
        <mat-card-content class="!p-5">
          <h1 class="font-heading text-2xl mb-3">Payment History</h1>
          <table mat-table [dataSource]="payments" class="w-full">
            <ng-container matColumnDef="month">
              <th mat-header-cell *matHeaderCellDef>Month</th>
              <td mat-cell *matCellDef="let p">{{ p.month_number }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let p">{{ p.amount }}</td>
            </ng-container>
            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>Method</th>
              <td mat-cell *matCellDef="let p">{{ p.method }}</td>
            </ng-container>
            <ng-container matColumnDef="reference">
              <th mat-header-cell *matHeaderCellDef>Reference</th>
              <td mat-cell *matCellDef="let p">{{ p.transaction_reference || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">{{ p.status }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="!p-5">
          <h2 class="font-semibold mb-2">Mark payment as received</h2>
          <form [formGroup]="form" class="grid md:grid-cols-3 gap-3" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Member ID</mat-label>
              <input matInput formControlName="member_id" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Month Number</mat-label>
              <input matInput type="number" formControlName="month_number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Method</mat-label>
              <mat-select formControlName="method">
                <mat-option value="bank">Bank</mat-option>
                <mat-option value="jazzcash">JazzCash</mat-option>
                <mat-option value="easypaisa">Easypaisa</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Transaction reference</mat-label>
              <input matInput formControlName="transaction_reference" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Notes</mat-label>
              <input matInput formControlName="notes" />
            </mat-form-field>
            <div class="md:col-span-3">
              <label class="text-sm">Upload proof</label>
              <input type="file" accept="image/*" (change)="onFile($event)" />
            </div>
            <button mat-raised-button class="!bg-navy !text-white md:col-span-3" [disabled]="form.invalid">Confirm Payment</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class CommitteePaymentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly toastr = inject(ToastrService);

  payments: Payment[] = [];
  committeeId = '';
  proofFile?: File;
  readonly displayedColumns = ['month', 'amount', 'method', 'reference', 'status'];

  readonly form = this.fb.nonNullable.group({
    member_id: ['', Validators.required],
    month_number: [1, [Validators.required, Validators.min(1)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    method: this.fb.nonNullable.control<'bank' | 'jazzcash' | 'easypaisa'>('bank'),
    transaction_reference: ['', Validators.required],
    notes: ['']
  });

  constructor() {
    const committeeId = this.route.snapshot.paramMap.get('id');
    if (committeeId) {
      this.committeeId = committeeId;
      void this.load();
    }
  }

  async load(): Promise<void> {
    this.payments = await this.paymentService.getCommitteePayments(this.committeeId);
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.proofFile = input.files?.[0];
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    try {
      await this.paymentService.markAsPaid({
        committee_id: this.committeeId,
        ...this.form.getRawValue(),
        proofFile: this.proofFile
      });
      this.toastr.success('Payment confirmed');
      await this.load();
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
