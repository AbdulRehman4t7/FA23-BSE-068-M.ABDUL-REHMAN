import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommitteeService } from '../../core/services/committee.service';
import { AuthService } from '../../core/services/auth.service';
import { Committee } from '../../core/models/committee.model';
import { CurrencyPkrPipe } from '../../shared/pipes/currency-pkr.pipe';
import { StatusColorPipe } from '../../shared/pipes/status-color.pipe';
import { ReputationBadgeComponent } from '../../shared/components/reputation-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CurrencyPkrPipe,
    StatusColorPipe,
    ReputationBadgeComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
        <button mat-raised-button color="primary" routerLink="/committee/create">
          <mat-icon>add</mat-icon>
          Create Committee
        </button>
      </div>

      <mat-tab-group class="mb-6">
        <!-- My Committees Tab -->
        <mat-tab label="My Committees">
          <div class="py-6">
            @if (loading()) {
              <div class="text-center py-12">
                <mat-icon class="text-6xl text-gray-400 animate-spin">refresh</mat-icon>
                <p class="text-gray-600 mt-4">Loading committees...</p>
              </div>
            } @else if (myCommittees().length === 0) {
              <div class="text-center py-12">
                <mat-icon class="text-6xl text-gray-400">group</mat-icon>
                <p class="text-gray-600 mt-4">You haven't joined any committees yet</p>
                <button mat-raised-button color="primary" routerLink="/committee/create" class="mt-4">
                  Create Your First Committee
                </button>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (committee of myCommittees(); track committee.id) {
                  <mat-card class="hover:shadow-lg transition-shadow cursor-pointer" 
                            [routerLink]="['/committee', committee.id]">
                    <mat-card-header>
                      <mat-card-title class="text-lg">{{ committee.name }}</mat-card-title>
                      <mat-card-subtitle>
                        <span [class]="committee.status | statusColor" 
                              class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ committee.status | titlecase }}
                        </span>
                      </mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Monthly Amount:</span>
                          <span class="font-semibold">{{ committee.monthly_amount | currencyPkr }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Duration:</span>
                          <span class="font-semibold">{{ committee.total_months }} months</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Members:</span>
                          <span class="font-semibold">{{ committee.current_members_count }}/{{ committee.max_members }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Start Date:</span>
                          <span class="font-semibold">{{ committee.start_date | date:'MMM d, y' }}</span>
                        </div>
                      </div>
                    </mat-card-content>
                    <mat-card-actions class="flex justify-end gap-2">
                      <button mat-button color="primary" [routerLink]="['/committee', committee.id]">
                        View Details
                      </button>
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-tab>

        <!-- Explore Tab -->
        <mat-tab label="Explore">
          <div class="py-6">
            <!-- Filters -->
            <mat-card class="mb-6">
              <mat-card-content>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <mat-form-field appearance="outline">
                    <mat-label>Min Amount</mat-label>
                    <input matInput type="number" [(ngModel)]="filters.minAmount" 
                           (ngModelChange)="applyFilters()">
                    <span matPrefix>PKR&nbsp;</span>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Max Amount</mat-label>
                    <input matInput type="number" [(ngModel)]="filters.maxAmount" 
                           (ngModelChange)="applyFilters()">
                    <span matPrefix>PKR&nbsp;</span>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Duration</mat-label>
                    <mat-select [(ngModel)]="filters.duration" (ngModelChange)="applyFilters()">
                      <mat-option [value]="undefined">All</mat-option>
                      <mat-option [value]="6">6 months</mat-option>
                      <mat-option [value]="10">10 months</mat-option>
                      <mat-option [value]="12">12 months</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Min Reputation</mat-label>
                    <mat-select [(ngModel)]="filters.minReputation" (ngModelChange)="applyFilters()">
                      <mat-option [value]="undefined">All</mat-option>
                      <mat-option [value]="2.0">2.0+</mat-option>
                      <mat-option [value]="3.5">3.5+</mat-option>
                      <mat-option [value]="4.5">4.5+</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </mat-card-content>
            </mat-card>

            @if (loadingPublic()) {
              <div class="text-center py-12">
                <mat-icon class="text-6xl text-gray-400 animate-spin">refresh</mat-icon>
                <p class="text-gray-600 mt-4">Loading public committees...</p>
              </div>
            } @else if (publicCommittees().length === 0) {
              <div class="text-center py-12">
                <mat-icon class="text-6xl text-gray-400">search_off</mat-icon>
                <p class="text-gray-600 mt-4">No public committees found</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (committee of publicCommittees(); track committee.id) {
                  <mat-card class="hover:shadow-lg transition-shadow">
                    <mat-card-header>
                      <mat-card-title class="text-lg">{{ committee.name }}</mat-card-title>
                      <mat-card-subtitle>
                        @if (committee.creator) {
                          <div class="flex items-center gap-2 mt-2">
                            <span class="text-xs text-gray-600">by {{ committee.creator.full_name }}</span>
                            <app-reputation-badge 
                              [score]="committee.creator.reputation_score" 
                              [badge]="committee.creator.badge">
                            </app-reputation-badge>
                          </div>
                        }
                      </mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                      <p class="text-sm text-gray-600 mb-4">{{ committee.description }}</p>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Monthly Amount:</span>
                          <span class="font-semibold">{{ committee.monthly_amount | currencyPkr }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Duration:</span>
                          <span class="font-semibold">{{ committee.total_months }} months</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Slots Available:</span>
                          <span class="font-semibold">
                            {{ committee.max_members - committee.current_members_count }}/{{ committee.max_members }}
                          </span>
                        </div>
                      </div>
                    </mat-card-content>
                    <mat-card-actions class="flex justify-between">
                      <button mat-button [routerLink]="['/committee', committee.id]">View Details</button>
                      <button mat-raised-button color="primary" (click)="requestToJoin(committee.id)">
                        Request to Join
                      </button>
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  myCommittees = signal<Committee[]>([]);
  publicCommittees = signal<Committee[]>([]);
  loading = signal(false);
  loadingPublic = signal(false);

  filters = {
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
    duration: undefined as number | undefined,
    minReputation: undefined as number | undefined
  };

  constructor(
    private committeeService: CommitteeService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    await this.loadMyCommittees();
    await this.loadPublicCommittees();
  }

  async loadMyCommittees() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.loading.set(true);
    try {
      const committees = await this.committeeService.getMyCommittees(userId);
      this.myCommittees.set(committees);
    } catch (error) {
      this.toastr.error('Failed to load committees', 'Error');
    } finally {
      this.loading.set(false);
    }
  }

  async loadPublicCommittees() {
    this.loadingPublic.set(true);
    try {
      const committees = await this.committeeService.getPublicCommittees(this.filters);
      this.publicCommittees.set(committees);
    } catch (error) {
      this.toastr.error('Failed to load public committees', 'Error');
    } finally {
      this.loadingPublic.set(false);
    }
  }

  applyFilters() {
    this.loadPublicCommittees();
  }

  async requestToJoin(committeeId: string) {
    const userId = this.authService.getUserId();
    if (!userId) return;

    try {
      await this.committeeService.requestToJoin(committeeId, userId);
      this.toastr.success('Join request sent successfully', 'Success');
    } catch (error: any) {
      this.toastr.error(error.message || 'Failed to send join request', 'Error');
    }
  }
}
