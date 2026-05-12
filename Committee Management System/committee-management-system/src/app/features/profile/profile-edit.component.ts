import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="max-w-3xl mx-auto py-8">
      <mat-card>
        <mat-card-header class="mb-6">
          <mat-card-title class="text-2xl">Edit Profile</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="full_name">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>CNIC</mat-label>
              <input matInput formControlName="cnic">
              <mat-icon matPrefix>badge</mat-icon>
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Bank Name</mat-label>
              <input matInput formControlName="bank_name">
              <mat-icon matPrefix>account_balance</mat-icon>
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>IBAN</mat-label>
              <input matInput formControlName="iban">
              <mat-icon matPrefix>credit_card</mat-icon>
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>JazzCash Number</mat-label>
              <input matInput formControlName="jazzcash_number">
              <mat-icon matPrefix>phone_android</mat-icon>
            </mat-form-field>

            <mat-form-field class="w-full" appearance="outline">
              <mat-label>Easypaisa Number</mat-label>
              <input matInput formControlName="easypaisa_number">
              <mat-icon matPrefix>phone_android</mat-icon>
            </mat-form-field>

            <div class="flex justify-end gap-2">
              <button mat-button type="button" routerLink="/profile/view">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="loading() || profileForm.invalid">
                @if (loading()) {
                  <mat-icon class="animate-spin">refresh</mat-icon>
                }
                Save Changes
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      phone: ['', Validators.required],
      cnic: [''],
      bank_name: [''],
      iban: [''],
      jazzcash_number: [''],
      easypaisa_number: ['']
    });
  }

  async ngOnInit() {
    const profile = this.profileService.currentProfile();
    if (profile) {
      this.profileForm.patchValue(profile);
    }
  }

  async onSubmit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.loading.set(true);
    try {
      await this.profileService.updateProfile(userId, this.profileForm.value);
      this.toastr.success('Profile updated successfully', 'Success');
      this.router.navigate(['/profile/view']);
    } catch (error: any) {
      this.toastr.error(error.message || 'Failed to update profile', 'Error');
    } finally {
      this.loading.set(false);
    }
  }
}
