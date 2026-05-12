import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { AuthService } from './core/services/auth.service';
import { ProfileService } from './core/services/profile.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>
      <main class="container mx-auto px-4 py-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    // Wait for auth to initialize
    while (this.authService.loading()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const userId = this.authService.getUserId();
    if (userId) {
      await this.profileService.loadCurrentProfile(userId);
      await this.notificationService.loadNotifications(userId);
      this.notificationService.subscribeToNotifications(userId);
    }
  }

  ngOnDestroy() {
    this.notificationService.unsubscribeFromNotifications();
  }
}
