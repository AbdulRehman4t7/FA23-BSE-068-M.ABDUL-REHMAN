import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CommitteeService } from '../../core/services/committee.service';
import { Committee } from '../../core/models/committee.model';
import { CurrencyPkrPipe } from '../../shared/pipes/currency-pkr.pipe';
import { StatusColorPipe } from '../../shared/pipes/status-color.pipe';

@Component({
  selector: 'app-committee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    CurrencyPkrPipe,
    StatusColorPipe
  ],
  template: `
    <div class="max-w-7xl mx-auto py-8">
      @if (committee(); as comm) {
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-card-title class="text-2xl">{{ comm.name }}</mat-card-title>
            <mat-card-subtitle>
              <span [class]="comm.status | statusColor" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ comm.status | titlecase }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="mt-4">
            <p class="text-gray-700 mb-4">{{ comm.description }}</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-sm text-gray-600">Monthly Amount</p>
                <p class="text-lg font-semibold">{{ comm.monthly_amount | currencyPkr }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Duration</p>
                <p class="text-lg font-semibold">{{ comm.total_months }} months</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Members</p>
                <p class="text-lg font-semibold">{{ comm.current_members_count }}/{{ comm.max_members }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Start Date</p>
                <p class="text-lg font-semibold">{{ comm.start_date | date:'MMM d, y' }}</p>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button [routerLink]="['/committee', comm.id, 'members']">
              <mat-icon>group</mat-icon>
              Manage Members
            </button>
            <button mat-button [routerLink]="['/committee', comm.id, 'payments']">
              <mat-icon>payment</mat-icon>
              View Payments
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `
})
export class CommitteeDetailComponent implements OnInit {
  committee = signal<Committee | null>(null);

  constructor(
    private route: ActivatedRoute,
    private committeeService: CommitteeService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const comm = await this.committeeService.getCommitteeById(id);
      this.committee.set(comm);
    }
  }
}
