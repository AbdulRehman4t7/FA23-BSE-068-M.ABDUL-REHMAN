import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from '../../core/models/user.model';
import { ReputationBadgeComponent } from '../../shared/components/reputation-badge.component';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ReputationBadgeComponent
  ],
  template: `
    <div class="max-w-4xl mx-auto py-8">
      @if (profile(); as prof) {
        <mat-card>
          <mat-card-header class="flex items-center gap-4 mb-6">
            @if (prof.avatar_url) {
              <img [src]="prof.avatar_url" class="w-24 h-24 rounded-full" [alt]="prof.full_name">
            } @else {
              <div class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <mat-icon class="text-5xl text-gray-400">person</mat-icon>
              </div>
            }
            <div class="flex-1">
              <mat-card-title class="text-2xl">{{ prof.full_name }}</mat-card-title>
              <mat-card-subtitle>
                <app-reputation-badge [score]="prof.reputation_score" [badge]="prof.badge"></app-reputation-badge>
              </mat-card-subtitle>
            </div>
            <button mat-raised-button color="primary" routerLink="/profile/edit">
              <mat-icon>edit</mat-icon>
              Edit Profile
            </button>
          </mat-card-header>

          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Contact Information -->
              <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  <mat-icon>contact_phone</mat-icon>
                  Contact Information
                </h3>
                <div class="space-y-3">
                  <div>
                    <p class="text-sm text-gray-600">Phone</p>
                    <p class="font-medium">{{ prof.phone }}</p>
                  </div>
                  @if (prof.cnic) {
                    <div>
                      <p class="text-sm text-gray-600">CNIC</p>
                      <p class="font-medium">{{ prof.cnic }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Bank Details -->
              <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  <mat-icon>account_balance</mat-icon>
                  Bank Details
                </h3>
                <div class="space-y-3">
                  @if (prof.bank_name) {
                    <div>
                      <p class="text-sm text-gray-600">Bank Name</p>
                      <p class="font-medium">{{ prof.bank_name }}</p>
                    </div>
                  }
                  @if (prof.iban) {
                    <div>
                      <p class="text-sm text-gray-600">IBAN</p>
                      <p class="font-medium">{{ prof.iban }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Mobile Wallet -->
              <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  <mat-icon>phone_android</mat-icon>
                  Mobile Wallet
                </h3>
                <div class="space-y-3">
                  @if (prof.jazzcash_number) {
                    <div>
                      <p class="text-sm text-gray-600">JazzCash</p>
                      <p class="font-medium">{{ prof.jazzcash_number }}</p>
                    </div>
                  }
                  @if (prof.easypaisa_number) {
                    <div>
                      <p class="text-sm text-gray-600">Easypaisa</p>
                      <p class="font-medium">{{ prof.easypaisa_number }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Statistics -->
              <div>
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  <mat-icon>analytics</mat-icon>
                  Statistics
                </h3>
                <div class="space-y-3">
                  <div>
                    <p class="text-sm text-gray-600">Reputation Score</p>
                    <p class="font-medium">{{ prof.reputation_score.toFixed(1) }} / 5.0</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Committees Completed</p>
                    <p class="font-medium">{{ prof.total_committees_completed }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Member Since</p>
                    <p class="font-medium">{{ prof.created_at | date:'MMM d, y' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `
})
export class ProfileViewComponent implements OnInit {
  profile = this.profileService.currentProfile;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  async ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId && !this.profile()) {
      await this.profileService.loadCurrentProfile(userId);
    }
  }
}
