import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { ReputationBadgeComponent } from '../../shared/components/reputation-badge.component';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, ReputationBadgeComponent],
  template: `
    @if (auth.profile(); as profile) {
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
    }
  `
})
export class ProfileViewComponent {
  readonly auth = inject(AuthService);
}
