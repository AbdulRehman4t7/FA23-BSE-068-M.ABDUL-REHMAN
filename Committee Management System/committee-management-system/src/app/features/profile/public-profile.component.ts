import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from '../../core/models/user.model';
import { ReputationBadgeComponent } from '../../shared/components/reputation-badge.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [MatCardModule, ReputationBadgeComponent],
  template: `
    @if (profile) {
      <mat-card>
        <mat-card-content class="!p-6">
          <div class="flex items-center gap-3">
            <img [src]="profile.avatar_url || 'https://placehold.co/120x120'" alt="avatar" class="w-20 h-20 rounded-full" />
            <div>
              <h1 class="font-heading text-2xl">{{ profile.full_name }}</h1>
              <app-reputation-badge [score]="profile.reputation_score" [badge]="profile.badge" />
            </div>
          </div>
          <div class="mt-4 text-sm space-y-1">
            <p>Completed committees: {{ profile.total_committees_completed }}</p>
            <p>Contact: {{ profile.phone }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `
})
export class PublicProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  profile: UserProfile | null = null;

  constructor() {
    const profileId = this.route.snapshot.paramMap.get('id');
    if (profileId) {
      void this.load(profileId);
    }
  }

  async load(profileId: string): Promise<void> {
    this.profile = await this.profileService.getProfileById(profileId);
  }
}
