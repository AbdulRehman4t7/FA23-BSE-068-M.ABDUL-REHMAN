import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile-complete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule
  ],
  template: `
    <div class="max-w-3xl mx-auto py-8">
      <mat-card>
        <mat-card-header class="mb-6">
          <mat-card-title class="text-2xl">Complete Your Profile</mat-card-title>
          <mat-card-subtitle>Please provide your payment details to join committees</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            <!-- Step 1: Basic Info -->
            <mat-step [stepControl]="basicInfoForm">
              <form [formGroup]="basicInfoForm">
                <ng-template matStepLabel>Basic Information</ng-template>
                
                <div class="space-y-4 py-4">
                  <mat-form-field class="w-full" appearance="outline">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="full_name" placeholder="Ahmed Khan">
                    <mat-icon matPrefix>person</mat-icon>
                  </mat-form-field>

                  <mat-form-field class="w-full" appearance="outline">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" placeholder="+92-300-1234567">
                    <mat-icon matPrefix>phone</mat-icon>
                  </mat-form-field>

                  <mat-form-field class="w-full" appearance="outline">
                    <mat-label>CNIC (Optional)</mat-label>
                    <input matInput formControlName="cnic" placeholder="12345-1234567-1">
                    <mat-icon matPrefix>badge</mat-icon>
                  </mat-form-field>

                  <div class="flex justify-end gap-2">
                    <button mat-raised-button color="primary" matStepperNext>Next</button>
                  </div>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Bank Details -->
            <mat-step [stepControl]="bankDetailsForm">
              <form [formGroup]="bankDetailsForm">
                <ng-template matStepLabel>Bank Details</ng-template>
                
                <div class="space-y-4 py-4">
                  <p class="text-sm text-gray-600 mb-4">
                    Provide at least one payment method to receive committee payouts
                  </p>

                  <mat-form-field class="w-full" appearance="outline">
                    <mat-label>Bank Name</mat-label>
                    <input matInput formControlName="bank_name" placeholder="Habib Bank Limited">
                    <mat-icon matPrefix>account_balance</mat-icon>
                  </mat-form-field>

                  <mat-form-field class="w-full" appearance="outline">
                    <mat-label>IBAN</mat-label>
                    <input matInput formControlName="iban" placeholder="PK36HABB0000123456789012">
                    <mat-icon matPrefix>credit_card</mat-icon>
                  </mat-form-field>

                  <div class="flex justify-end gap-2">
                    <button mat-button matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" matStepperNext>Next</button>
                  </div>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Mobile Wallet -->
            <mat-step [stepControl]="walletForm">
              <form [formGroup]="walletForm">
                <ng-template matStepLabel>Mobile Wallet (Optional)</ng-template>
                
                <div class="space-y-4 py-4">
                  <mat-form-field class="w-full" appearance="outline">
                    <mat-label>JazzCash Number</mat-label>
                    <input matInput formControlName="jazzcash_number" placeholder="03001234567">
                    <mat-icon matPrefix>phone_android</mat-icon>
                  </mat-form-field>

                  <mat-form-field class="w-full" appearance="outline">
                    <mat-label>Easypaisa Number</mat-label>
                    <input matInput formControlName="easypaisa_number" placeholder="03001234567">
                    <mat-icon matPrefix>phone_android</mat-icon>
                  </mat-form-field>

                  <div class="flex justify-end gap-2">
                    <button mat-button matStepperPrevious>Back</button>
                    <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading()">
                      @if (loading()) {
                        <mat-icon class="animate-spin">refresh</mat-icon>
                      }
                      Complete Profile
                    </button>
                  </div>
                </div>
              </form>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProfileCompleteComponent implements OnInit {
  basicInfoForm: FormGroup;
  bankDetailsForm: FormGroup;
  walletForm: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.basicInfoForm = this.fb.group({
      full_name: ['', Validators.required],
      phone: ['', Validators.required],
      cnic: ['']
    });

    this.bankDetailsForm = this.fb.group({
      bank_name: [''],
      iban: ['']
    });

    this.walletForm = this.fb.group({
      jazzcash_number: [''],
      easypaisa_number: ['']
    });
  }

  async ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const profile = await this.profileService.getProfile(userId);
      this.basicInfoForm.patchValue({
        full_name: profile.full_name,
        phone: profile.phone,
        cnic: profile.cnic
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async onSubmit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    // Validate at least one payment method
    const bankDetails = this.bankDetailsForm.value;
    const walletDetails = this.walletForm.value;
    
    if (!bankDetails.iban && !walletDetails.jazzcash_number && !walletDetails.easypaisa_number) {
      this.toastr.error('Please provide at least one payment method', 'Error');
      return;
    }

    this.loading.set(true);
    try {
      const updates = {
        ...this.basicInfoForm.value,
        ...bankDetails,
        ...walletDetails
      };

      await this.profileService.updateProfile(userId, updates);
      this.toastr.success('Profile completed successfully', 'Success');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.toastr.error(error.message || 'Failed to update profile', 'Error');
    } finally {
      this.loading.set(false);
    }
  }
}
