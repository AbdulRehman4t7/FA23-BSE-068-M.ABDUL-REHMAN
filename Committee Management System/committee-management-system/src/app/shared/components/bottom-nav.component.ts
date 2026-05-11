import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t grid grid-cols-4 py-2">
      <a routerLink="/dashboard" routerLinkActive="text-amber-500" class="text-xs text-center flex flex-col items-center"><mat-icon>dashboard</mat-icon>Home</a>
      <a routerLink="/committee/create" routerLinkActive="text-amber-500" class="text-xs text-center flex flex-col items-center"><mat-icon>add_box</mat-icon>Create</a>
      <a routerLink="/notifications" routerLinkActive="text-amber-500" class="text-xs text-center flex flex-col items-center"><mat-icon>notifications</mat-icon>Alerts</a>
      <a routerLink="/profile" routerLinkActive="text-amber-500" class="text-xs text-center flex flex-col items-center"><mat-icon>person</mat-icon>Profile</a>
    </nav>
  `
})
export class BottomNavComponent {}
