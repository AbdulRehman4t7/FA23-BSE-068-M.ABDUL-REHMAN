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
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="min-h-screen grid place-items-center p-4">
      <mat-card class="w-full max-w-xl !rounded-2xl !shadow-lg">
        <mat-card-content class="!p-6">
          <h1 class="font-heading text-2xl mb-4">Create account</h1>
          <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-3" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>CNIC (optional)</mat-label>
              <input matInput formControlName="cnic" />
            </mat-form-field>
            <div class="md:col-span-2">
              <label class="text-sm font-medium">Profile picture</label>
              <input type="file" class="block mt-1" (change)="onFile($event)" accept="image/*" />
            </div>
            <button mat-raised-button color="primary" class="md:col-span-2 !bg-navy" [disabled]="form.invalid">Sign up</button>
          </form>
          <p class="mt-4 text-sm">Already have an account? <a routerLink="/auth/login" class="text-amber-600">Login</a></p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private avatarFile?: File;

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', Validators.required],
    cnic: ['']
  });

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.avatarFile = input.files?.[0];
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    try {
      await this.auth.signUp({ ...this.form.getRawValue(), avatarFile: this.avatarFile });
      this.toastr.success('Account created. Please verify your email.');
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
