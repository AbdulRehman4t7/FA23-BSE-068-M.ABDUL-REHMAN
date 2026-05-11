import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="min-h-screen grid place-items-center p-4">
      <mat-card class="w-full max-w-md">
        <mat-card-content class="!p-6">
          <h1 class="font-heading text-2xl mb-2">Reset password</h1>
          <p class="text-sm text-slate-500 mb-4">We'll send a reset link to your email.</p>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <button mat-raised-button color="primary" class="w-full !bg-navy" [disabled]="form.invalid">Send reset link</button>
          </form>
          <a routerLink="/auth/login" class="block mt-4 text-sm text-amber-600">Back to login</a>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    try {
      await this.auth.resetPassword(this.form.getRawValue().email);
      this.toastr.success('Password reset email sent');
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
