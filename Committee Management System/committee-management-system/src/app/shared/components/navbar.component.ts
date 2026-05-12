import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule],
  template: `
    <mat-toolbar class="!bg-navy !text-white !sticky !top-0 !z-20">
      <a routerLink="/dashboard" class="font-heading text-xl text-amber-400">CommitteePro</a>
      <span class="flex-1"></span>
      <button mat-icon-button routerLink="/notifications" [matBadge]="notifications.unreadCount()" matBadgeColor="warn" [matBadgeHidden]="!notifications.unreadCount()">
        <mat-icon>notifications</mat-icon>
      </button>
      <button mat-icon-button (click)="toggleTheme()">
        <mat-icon>{{ darkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>
      <button mat-button routerLink="/profile">Profile</button>
      <button mat-stroked-button class="!text-amber-400 !border-amber-400" (click)="logout()">Logout</button>
    </mat-toolbar>
  `
})
export class NavbarComponent {
  readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  darkMode = typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark';

  constructor() {
    this.applyTheme();
  }

  logout(): void {
    void this.auth.logout();
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.classList.toggle('dark', this.darkMode);
  }
}
