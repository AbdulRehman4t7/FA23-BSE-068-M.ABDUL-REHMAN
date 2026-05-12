import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../core/services/notification.service';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TimeAgoPipe
  ],
  template: `
    <div class="max-w-4xl mx-auto py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Notifications</h1>
        @if (notificationService.unreadCount() > 0) {
          <button mat-button (click)="markAllAsRead()">Mark all as read</button>
        }
      </div>

      <mat-card>
        @if (notificationService.notifications().length === 0) {
          <div class="text-center py-12">
            <mat-icon class="text-6xl text-gray-400">notifications_none</mat-icon>
            <p class="text-gray-600 mt-4">No notifications yet</p>
          </div>
        } @else {
          <div class="divide-y">
            @for (notification of notificationService.notifications(); track notification.id) {
              <div class="p-4 hover:bg-gray-50 cursor-pointer" 
                   [class.bg-blue-50]="!notification.is_read"
                   (click)="markAsRead(notification.id)">
                <div class="flex items-start gap-4">
                  <mat-icon [class]="notificationService.getNotificationColor(notification.type)">
                    {{ notificationService.getNotificationIcon(notification.type) }}
                  </mat-icon>
                  <div class="flex-1">
                    <h3 class="font-semibold">{{ notification.title }}</h3>
                    <p class="text-sm text-gray-600">{{ notification.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ notification.created_at | timeAgo }}</p>
                  </div>
                  @if (!notification.is_read) {
                    <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </mat-card>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  constructor(public notificationService: NotificationService) {}

  ngOnInit() {}

  async markAsRead(id: string) {
    await this.notificationService.markAsRead(id);
  }

  async markAllAsRead() {
    const userId = this.notificationService.notifications()[0]?.user_id;
    if (userId) {
      await this.notificationService.markAllAsRead(userId);
    }
  }
}
