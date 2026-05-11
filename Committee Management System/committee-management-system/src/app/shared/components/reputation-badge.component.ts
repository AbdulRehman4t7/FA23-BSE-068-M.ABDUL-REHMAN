import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-reputation-badge',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <div class="flex items-center gap-2">
      <span class="text-amber-500">★ {{ score.toFixed(1) }}</span>
      <mat-chip class="!bg-amber-100 !text-amber-900">{{ badgeLabel }}</mat-chip>
    </div>
  `
})
export class ReputationBadgeComponent {
  @Input() score = 0;
  @Input() badge: 'new' | 'trusted' | 'verified' | 'elite' = 'new';

  get badgeLabel(): string {
    return this.badge.charAt(0).toUpperCase() + this.badge.slice(1);
  }
}
