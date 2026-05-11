import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommitteeService } from '../../core/services/committee.service';
import { CommitteeMember } from '../../core/models/committee.model';

@Component({
  selector: 'app-committee-members',
  standalone: true,
  imports: [MatCardModule, MatTableModule, MatButtonModule],
  template: `
    <mat-card>
      <mat-card-content class="!p-5">
        <h1 class="font-heading text-2xl mb-3">Members Management</h1>
        <table mat-table [dataSource]="members" class="w-full">
          <ng-container matColumnDef="slot">
            <th mat-header-cell *matHeaderCellDef>Slot</th>
            <td mat-cell *matCellDef="let m">#{{ m.slot_number }}</td>
          </ng-container>
          <ng-container matColumnDef="turn">
            <th mat-header-cell *matHeaderCellDef>Turn Month</th>
            <td mat-cell *matCellDef="let m">{{ m.turn_month }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let m">{{ m.status }}</td>
          </ng-container>
          <ng-container matColumnDef="iban">
            <th mat-header-cell *matHeaderCellDef>IBAN</th>
            <td mat-cell *matCellDef="let m">{{ m.iban || '-' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `
})
export class CommitteeMembersComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly committeeService = inject(CommitteeService);

  members: CommitteeMember[] = [];
  readonly displayedColumns = ['slot', 'turn', 'status', 'iban'];

  constructor() {
    const committeeId = this.route.snapshot.paramMap.get('id');
    if (committeeId) {
      void this.load(committeeId);
    }
  }

  async load(committeeId: string): Promise<void> {
    this.members = await this.committeeService.getMembers(committeeId);
  }
}
