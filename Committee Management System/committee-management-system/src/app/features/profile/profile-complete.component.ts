import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile-complete',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="min-h-screen grid place-items-center p-4">
      <mat-card class="w-full max-w-xl">
        <mat-card-content class="!p-6">
          <h1 class="font-heading text-2xl mb-2">Complete your profile</h1>
          <p class="text-slate-500 mb-4">Please complete your details before accessing dashboard.</p>
          <form [formGroup]="form" class="grid md:grid-cols-2 gap-3" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="full_name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>IBAN</mat-label>
              <input matInput formControlName="iban" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Bank Name</mat-label>
              <input matInput formControlName="bank_name" />
            </mat-form-field>
            <button mat-raised-button class="md:col-span-2 !bg-navy !text-white" [disabled]="form.invalid">Continue</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProfileCompleteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    full_name: ['', Validators.required],
    phone: ['', Validators.required],
    iban: [''],
    bank_name: ['']
  });

  constructor() {
    const profile = this.auth.profile();
    if (profile) this.form.patchValue(profile);
  }

  async submit(): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId || this.form.invalid) return;
    try {
      await this.profileService.updateProfile(userId, this.form.getRawValue());
      await this.auth.loadProfile();
      this.toastr.success('Profile completed');
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }
}
