import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reputation-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="flex items-center gap-2">
      <div class="flex items-center">
        <mat-icon class="text-amber-500 text-sm">star</mat-icon>
        <span class="text-sm font-semibold ml-1">{{ score.toFixed(1) }}</span>
      </div>
      <span 
        [class]="getBadgeClass()"
        [matTooltip]="getBadgeTooltip()"
        class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <mat-icon class="text-xs">{{ getBadgeIcon() }}</mat-icon>
        {{ badge | titlecase }}
      </span>
    </div>
  `
})
export class ReputationBadgeComponent {
  @Input() score: number = 0;
  @Input() badge: string = 'new';

  getBadgeClass(): string {
    const classes: { [key: string]: string } = {
      'new': 'bg-gray-100 text-gray-700',
      'trusted': 'bg-blue-100 text-blue-700',
      'verified': 'bg-green-100 text-green-700',
      'elite': 'bg-amber-100 text-amber-700'
    };
    return classes[this.badge] || classes['new'];
  }

  getBadgeIcon(): string {
    const icons: { [key: string]: string } = {
      'new': 'person',
      'trusted': 'verified_user',
      'verified': 'check_circle',
      'elite': 'stars'
    };
    return icons[this.badge] || 'person';
  }

  getBadgeTooltip(): string {
    const tooltips: { [key: string]: string } = {
      'new': 'New member - building reputation',
      'trusted': 'Trusted member - good payment history',
      'verified': 'Verified member - excellent track record',
      'elite': 'Elite member - outstanding reputation'
    };
    return tooltips[this.badge] || '';
  }
}
