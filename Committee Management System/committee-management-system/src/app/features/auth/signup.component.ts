import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
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
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 px-4 py-8">
      <mat-card class="w-full max-w-md">
        <mat-card-header class="flex flex-col items-center pb-4">
          <div class="flex items-center gap-2 mb-2">
            <mat-icon class="text-amber-500 text-4xl">account_balance</mat-icon>
          </div>
          <mat-card-title class="text-2xl font-bold text-center">Create Account</mat-card-title>
          <mat-card-subtitle class="text-center">Join the committee system</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" placeholder="Ahmed Khan">
              <mat-icon matPrefix>person</mat-icon>
              @if (signupForm.get('fullName')?.hasError('required') && signupForm.get('fullName')?.touched) {
                <mat-error>Full name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" placeholder="+92-300-1234567">
              <mat-icon matPrefix>phone</mat-icon>
              @if (signupForm.get('phone')?.hasError('required') && signupForm.get('phone')?.touched) {
                <mat-error>Phone number is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="your@email.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (signupForm.get('email')?.hasError('required') && signupForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (signupForm.get('email')?.hasError('email')) {
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
              @if (signupForm.get('password')?.hasError('required') && signupForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (signupForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="w-full" 
                    [disabled]="loading() || signupForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              Create Account
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer class="text-center pt-4">
          <p class="text-sm text-gray-600">
            Already have an account?
            <a routerLink="/auth/login" class="text-amber-600 hover:text-amber-700 font-semibold">
              Sign in
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
export class SignupComponent {
  signupForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;

    this.loading.set(true);
    try {
      const { email, password, fullName, phone } = this.signupForm.value;
      await this.authService.signUp(email, password, fullName, phone);
      
      this.toastr.success('Please check your email to verify your account', 'Account Created');
      this.router.navigate(['/auth/login']);
    } catch (error: any) {
      this.toastr.error(error.message || 'Signup failed', 'Error');
    } finally {
      this.loading.set(false);
    }
  }
}
