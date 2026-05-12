import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4">
      <mat-card class="w-full max-w-md">
        <mat-card-header class="flex flex-col items-center pb-4">
          <div class="flex items-center gap-2 mb-2">
            <mat-icon class="text-amber-500 text-4xl">account_balance</mat-icon>
          </div>
          <mat-card-title class="text-2xl font-bold text-center">Welcome Back</mat-card-title>
          <mat-card-subtitle class="text-center">Sign in to your committee account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="your@email.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>Invalid email format</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <div class="flex items-center justify-between">
              <mat-checkbox formControlName="rememberMe">Remember me</mat-checkbox>
              <a routerLink="/auth/reset-password" class="text-sm text-amber-600 hover:text-amber-700">
                Forgot password?
              </a>
            </div>

            <button mat-raised-button color="primary" type="submit" class="w-full" 
                    [disabled]="loading() || loginForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              Sign In
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer class="text-center pt-4">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <a routerLink="/auth/signup" class="text-amber-600 hover:text-amber-700 font-semibold">
              Sign up
            </a>
          </p>
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
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    try {
      const { email, password, rememberMe } = this.loginForm.value;
      await this.authService.signIn(email, password, rememberMe);
      
      this.toastr.success('Welcome back!', 'Login Successful');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.toastr.error(error.message || 'Login failed', 'Error');
    } finally {
      this.loading.set(false);
    }
  }
}
