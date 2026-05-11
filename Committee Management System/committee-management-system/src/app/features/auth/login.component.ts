import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <div class="min-h-screen grid place-items-center p-4">
      <mat-card class="w-full max-w-md !rounded-2xl !shadow-lg">
        <mat-card-content class="!p-6">
          <h1 class="font-heading text-2xl text-slate-900 mb-1">Welcome back</h1>
          <p class="text-sm text-slate-500 mb-4">Login to manage your committees</p>
          <form [formGroup]="form" class="flex flex-col gap-3" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
            <mat-checkbox formControlName="rememberMe">Remember me</mat-checkbox>
            <button mat-raised-button color="primary" class="!bg-navy" [disabled]="form.invalid">Login</button>
          </form>
          <div class="mt-4 text-sm flex justify-between">
            <a routerLink="/auth/reset-password" class="text-amber-600">Forgot password?</a>
            <a routerLink="/auth/signup" class="text-amber-600">Create account</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    try {
      const { email, password, rememberMe } = this.form.getRawValue();
      await this.auth.login(email, password, rememberMe);
      this.toastr.success('Logged in successfully');
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
