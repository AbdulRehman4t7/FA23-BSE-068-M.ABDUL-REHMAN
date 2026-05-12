import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../core/services/notification.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, TimeAgoPipe],
  template: `
    <section class="space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="font-heading text-2xl">Notifications</h1>
        <button mat-stroked-button (click)="markAllRead()">Mark all as read</button>
      </div>
      <div class="space-y-3">
        @for (item of notificationService.items(); track item.id) {
          <mat-card>
            <mat-card-content class="!p-4 flex justify-between items-start">
              <div>
                <p class="font-semibold">{{ item.title }}</p>
                <p class="text-sm text-slate-600">{{ item.message }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ item.created_at | timeAgo }}</p>
              </div>
              @if (!item.is_read) {
                <button mat-button class="!text-amber-600" (click)="markRead(item.id)">Mark read</button>
              }
            </mat-card-content>
          </mat-card>
        } @empty {
          <mat-card><mat-card-content class="!p-6 text-slate-500">No notifications yet.</mat-card-content></mat-card>
        }
      </div>
    </section>
  `
})
export class NotificationsComponent {
  readonly notificationService = inject(NotificationService);
  private readonly toastr = inject(ToastrService);

  constructor() {
    void this.notificationService.load();
    this.notificationService.startRealtime();
  }

  async markAllRead(): Promise<void> {
    await this.notificationService.markAllAsRead();
    this.toastr.success('All notifications marked as read');
  }

  async markRead(notificationId: string): Promise<void> {
    await this.notificationService.markAsRead(notificationId);
  }
}
