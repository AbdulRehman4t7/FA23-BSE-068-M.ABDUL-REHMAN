import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4">
      <mat-card class="w-full max-w-md">
        <mat-card-header class="flex flex-col items-center pb-4">
          <mat-icon class="text-amber-500 text-4xl mb-2">lock_reset</mat-icon>
          <mat-card-title class="text-2xl font-bold text-center">Reset Password</mat-card-title>
          <mat-card-subtitle class="text-center">Enter your email to receive reset instructions</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="your@email.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (resetForm.get('email')?.hasError('required') && resetForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (resetForm.get('email')?.hasError('email')) {
                <mat-error>Invalid email format</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="w-full" 
                    [disabled]="loading() || resetForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              Send Reset Link
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer class="text-center pt-4">
          <a routerLink="/auth/login" class="text-sm text-amber-600 hover:text-amber-700">
            Back to login
          </a>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-card {
      padding: 2rem;
    }
  `]
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.resetForm.invalid) return;

    this.loading.set(true);
    try {
      const { email } = this.resetForm.value;
      await this.authService.resetPassword(email);
      
      this.toastr.success('Check your email for reset instructions', 'Email Sent');
      this.resetForm.reset();
    } catch (error: any) {
      this.toastr.error(error.message || 'Failed to send reset email', 'Error');
    } finally {
      this.loading.set(false);
    }
  }
}
