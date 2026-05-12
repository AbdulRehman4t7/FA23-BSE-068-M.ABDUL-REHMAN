import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { ReputationBadgeComponent } from '../../shared/components/reputation-badge.component';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, ReputationBadgeComponent],
  template: `
    @if (auth.profile(); as profile) {
      <div class="space-y-4">
        <mat-card>
          <mat-card-content class="!p-6">
            <div class="flex flex-wrap items-center gap-4">
              <img [src]="profile.avatar_url || 'https://placehold.co/120x120'" alt="avatar" class="w-24 h-24 rounded-full object-cover" />
              <div class="space-y-1">
                <h1 class="font-heading text-2xl">{{ profile.full_name }}</h1>
                <p class="text-slate-500">{{ profile.phone }}</p>
                <app-reputation-badge [score]="profile.reputation_score" [badge]="profile.badge" />
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-3 mt-6 text-sm">
              <p><strong>IBAN:</strong> {{ profile.iban || '-' }}</p>
              <p><strong>Bank:</strong> {{ profile.bank_name || '-' }}</p>
              <p><strong>JazzCash:</strong> {{ profile.jazzcash_number || '-' }}</p>
              <p><strong>Easypaisa:</strong> {{ profile.easypaisa_number || '-' }}</p>
            </div>
            <a mat-raised-button class="mt-5 !bg-navy !text-white" routerLink="/profile/edit">Edit Profile</a>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="!p-6">
            <h2 class="font-semibold mb-3">Committee History</h2>
            <div class="grid md:grid-cols-4 gap-3 text-sm">
              <div class="rounded-lg bg-slate-100 p-3"><p class="text-slate-500">Created</p><p class="text-xl font-semibold">{{ history.created }}</p></div>
              <div class="rounded-lg bg-slate-100 p-3"><p class="text-slate-500">Joined</p><p class="text-xl font-semibold">{{ history.joined }}</p></div>
              <div class="rounded-lg bg-slate-100 p-3"><p class="text-slate-500">Completed</p><p class="text-xl font-semibold">{{ history.completed }}</p></div>
              <div class="rounded-lg bg-slate-100 p-3"><p class="text-slate-500">In Progress</p><p class="text-xl font-semibold">{{ history.inProgress }}</p></div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `
})
export class ProfileViewComponent {
  readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  history = { created: 0, joined: 0, completed: 0, inProgress: 0 };

  constructor() {
    const userId = this.auth.user()?.id;
    if (userId) void this.loadHistory(userId);
  }

  async loadHistory(userId: string): Promise<void> {
    await this.profileService.recalculateReputation(userId);
    await this.auth.loadProfile();
    this.history = await this.profileService.getCommitteeHistory(userId);
  }
}
