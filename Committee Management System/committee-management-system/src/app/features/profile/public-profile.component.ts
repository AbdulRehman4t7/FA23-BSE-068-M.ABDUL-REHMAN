import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from '../../core/models/user.model';
import { ReputationBadgeComponent } from '../../shared/components/reputation-badge.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, ReputationBadgeComponent],
  template: `
    <div class="max-w-4xl mx-auto py-8">
      @if (profile(); as prof) {
        <mat-card>
          <mat-card-header class="flex items-center gap-4">
            @if (prof.avatar_url) {
              <img [src]="prof.avatar_url" class="w-20 h-20 rounded-full" [alt]="prof.full_name">
            } @else {
              <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <mat-icon class="text-4xl text-gray-400">person</mat-icon>
              </div>
            }
            <div>
              <mat-card-title>{{ prof.full_name }}</mat-card-title>
              <mat-card-subtitle>
                <app-reputation-badge [score]="prof.reputation_score" [badge]="prof.badge"></app-reputation-badge>
              </mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content class="mt-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Reputation Score</p>
                <p class="font-medium">{{ prof.reputation_score.toFixed(1) }} / 5.0</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Committees Completed</p>
                <p class="font-medium">{{ prof.total_committees_completed }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `
})
export class PublicProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null);

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) {}

  async ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      const prof = await this.profileService.getProfile(userId);
      this.profile.set(prof);
    }
  }
}
