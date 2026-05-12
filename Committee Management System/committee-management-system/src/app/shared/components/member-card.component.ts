import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommitteeMember } from '../../core/models/committee.model';
import { ReputationBadgeComponent } from './reputation-badge.component';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, ReputationBadgeComponent],
  template: `
    @if (member) {
      <mat-card class="p-4">
        <div class="flex items-center gap-3">
          @if (member.profile?.avatar_url) {
            <img [src]="member.profile.avatar_url" class="w-12 h-12 rounded-full" [alt]="member.profile.full_name">
          } @else {
            <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <mat-icon>person</mat-icon>
            </div>
          }
          <div class="flex-1">
            <h3 class="font-semibold">{{ member.profile?.full_name }}</h3>
            <p class="text-sm text-gray-600">Slot {{ member.slot_number }} • Turn: Month {{ member.turn_month }}</p>
            @if (member.profile) {
              <app-reputation-badge 
                [score]="member.profile.reputation_score" 
                [badge]="member.profile.badge">
              </app-reputation-badge>
            }
          </div>
        </div>
      </mat-card>
    }
  `
})
export class MemberCardComponent {
  @Input() member?: CommitteeMember;
}
