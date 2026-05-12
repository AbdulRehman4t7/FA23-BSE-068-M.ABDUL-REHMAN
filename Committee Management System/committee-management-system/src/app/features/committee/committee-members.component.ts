import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CommitteeService } from '../../core/services/committee.service';
import { CommitteeMember } from '../../core/models/committee.model';

@Component({
  selector: 'app-committee-members',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="max-w-7xl mx-auto py-8">
      <h1 class="text-3xl font-bold mb-6">Committee Members</h1>
      <mat-card>
        @if (members().length === 0) {
          <div class="text-center py-12">
            <mat-icon class="text-6xl text-gray-400">group</mat-icon>
            <p class="text-gray-600 mt-4">No members yet</p>
          </div>
        } @else {
          <table mat-table [dataSource]="members()" class="w-full">
            <ng-container matColumnDef="slot">
              <th mat-header-cell *matHeaderCellDef>Slot</th>
              <td mat-cell *matCellDef="let member">{{ member.slot_number }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let member">{{ member.profile?.full_name }}</td>
            </ng-container>
            <ng-container matColumnDef="turn">
              <th mat-header-cell *matHeaderCellDef>Turn Month</th>
              <td mat-cell *matCellDef="let member">Month {{ member.turn_month }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        }
      </mat-card>
    </div>
  `
})
export class CommitteeMembersComponent implements OnInit {
  members = signal<CommitteeMember[]>([]);
  displayedColumns = ['slot', 'name', 'turn'];

  constructor(
    private route: ActivatedRoute,
    private committeeService: CommitteeService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const members = await this.committeeService.getCommitteeMembers(id);
      this.members.set(members);
    }
  }
}
