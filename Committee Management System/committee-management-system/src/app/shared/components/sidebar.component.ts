import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <nav class="w-64 bg-slate-900 text-white h-screen p-4">
      <mat-nav-list>
        <a mat-list-item routerLink="/dashboard" routerLinkActive="bg-slate-800">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        <a mat-list-item routerLink="/committee/create" routerLinkActive="bg-slate-800">
          <mat-icon matListItemIcon>add_circle</mat-icon>
          <span matListItemTitle>Create Committee</span>
        </a>
        <a mat-list-item routerLink="/notifications" routerLinkActive="bg-slate-800">
          <mat-icon matListItemIcon>notifications</mat-icon>
          <span matListItemTitle>Notifications</span>
        </a>
        <a mat-list-item routerLink="/profile/view" routerLinkActive="bg-slate-800">
          <mat-icon matListItemIcon>person</mat-icon>
          <span matListItemTitle>Profile</span>
        </a>
      </mat-nav-list>
    </nav>
  `
})
export class SidebarComponent {}
