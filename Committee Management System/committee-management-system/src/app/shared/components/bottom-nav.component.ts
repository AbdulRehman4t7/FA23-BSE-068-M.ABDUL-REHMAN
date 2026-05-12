import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div class="flex justify-around py-2">
        <a routerLink="/dashboard" routerLinkActive="text-amber-600" class="flex flex-col items-center p-2">
          <mat-icon>dashboard</mat-icon>
          <span class="text-xs">Dashboard</span>
        </a>
        <a routerLink="/committee/create" routerLinkActive="text-amber-600" class="flex flex-col items-center p-2">
          <mat-icon>add_circle</mat-icon>
          <span class="text-xs">Create</span>
        </a>
        <a routerLink="/notifications" routerLinkActive="text-amber-600" class="flex flex-col items-center p-2">
          <mat-icon>notifications</mat-icon>
          <span class="text-xs">Alerts</span>
        </a>
        <a routerLink="/profile/view" routerLinkActive="text-amber-600" class="flex flex-col items-center p-2">
          <mat-icon>person</mat-icon>
          <span class="text-xs">Profile</span>
        </a>
      </div>
    </nav>
  `
})
export class BottomNavComponent {}
