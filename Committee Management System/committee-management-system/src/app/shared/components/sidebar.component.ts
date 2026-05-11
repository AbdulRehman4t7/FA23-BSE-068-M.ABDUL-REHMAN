import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <aside class="hidden md:flex w-64 bg-slate-900 text-white flex-col p-4 gap-3">
      <a routerLink="/dashboard" routerLinkActive="text-amber-400" class="flex items-center gap-2"><mat-icon>dashboard</mat-icon> Dashboard</a>
      <a routerLink="/committee/create" routerLinkActive="text-amber-400" class="flex items-center gap-2"><mat-icon>add_box</mat-icon> Create Committee</a>
      <a routerLink="/notifications" routerLinkActive="text-amber-400" class="flex items-center gap-2"><mat-icon>notifications</mat-icon> Notifications</a>
      <a routerLink="/profile" routerLinkActive="text-amber-400" class="flex items-center gap-2"><mat-icon>person</mat-icon> Profile</a>
    </aside>
  `
})
export class SidebarComponent {}
