import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="bg-slate-900 text-white shadow-lg">
      <div class="container mx-auto flex items-center justify-between px-4">
        <div class="flex items-center gap-4">
          <a routerLink="/dashboard" class="flex items-center gap-2 text-xl font-bold">
            <mat-icon class="text-amber-500">account_balance</mat-icon>
            <span class="hidden md:inline">Committee System</span>
          </a>
        </div>

        @if (authService.isAuthenticated()) {
          <div class="flex items-center gap-2">
            <button mat-icon-button routerLink="/notifications" [matBadge]="unreadCount()" 
                    [matBadgeHidden]="unreadCount() === 0" matBadgeColor="warn">
              <mat-icon>notifications</mat-icon>
            </button>

            <button mat-button [matMenuTriggerFor]="userMenu" class="flex items-center gap-2">
              @if (profile(); as prof) {
                @if (prof.avatar_url) {
                  <img [src]="prof.avatar_url" class="w-8 h-8 rounded-full" [alt]="prof.full_name">
                } @else {
                  <mat-icon>account_circle</mat-icon>
                }
                <span class="hidden md:inline">{{ prof.full_name }}</span>
              } @else {
                <mat-icon>account_circle</mat-icon>
              }
              <mat-icon>arrow_drop_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/profile/view">
                <mat-icon>person</mat-icon>
                <span>My Profile</span>
              </button>
              <button mat-menu-item routerLink="/profile/edit">
                <mat-icon>edit</mat-icon>
                <span>Edit Profile</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </div>
        } @else {
          <div class="flex gap-2">
            <button mat-button routerLink="/auth/login">Login</button>
            <button mat-raised-button color="accent" routerLink="/auth/signup">Sign Up</button>
          </div>
        }
      </div>
    </mat-toolbar>
  `
})
export class NavbarComponent {
  profile = this.profileService.currentProfile;
  unreadCount = this.notificationService.unreadCount;

  constructor(
    public authService: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService
  ) {}

  logout() {
    this.authService.signOut();
  }
}
