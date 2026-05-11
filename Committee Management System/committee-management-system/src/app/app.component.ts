import { Component, computed, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { SidebarComponent } from './shared/components/sidebar.component';
import { BottomNavComponent } from './shared/components/bottom-nav.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, BottomNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly title = 'Committee Management System';
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  readonly showAppShell = computed(() => this.auth.isAuthenticated());

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        void this.notifications.load();
        this.notifications.startRealtime();
      }
    });
  }
}
