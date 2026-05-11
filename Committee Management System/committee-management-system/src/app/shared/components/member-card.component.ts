import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="!rounded-xl !shadow-sm">
      <mat-card-content class="!p-4 flex items-center gap-3">
        <img [src]="avatarUrl || 'https://placehold.co/80x80'" alt="avatar" class="w-12 h-12 rounded-full object-cover" />
        <div class="flex-1">
          <p class="font-semibold">{{ name }}</p>
          <p class="text-sm text-slate-500">Turn Month: {{ turnMonth }}</p>
        </div>
        <div class="text-amber-500">★ {{ reputation.toFixed(1) }}</div>
      </mat-card-content>
    </mat-card>
  `
})
export class MemberCardComponent {
  @Input() name = '';
  @Input() avatarUrl: string | null = null;
  @Input() turnMonth = 1;
  @Input() reputation = 0;
}
