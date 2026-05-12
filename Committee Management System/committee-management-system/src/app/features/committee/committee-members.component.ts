import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { CommitteeService } from '../../core/services/committee.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-committee-members',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="space-y-4">
      <mat-card>
        <mat-card-content class="!p-5">
          <h1 class="font-heading text-2xl mb-3">Members Management</h1>
          <table mat-table [dataSource]="members" class="w-full">
            <ng-container matColumnDef="slot">
              <th mat-header-cell *matHeaderCellDef>Slot</th>
              <td mat-cell *matCellDef="let m">#{{ m.slot_number }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Member</th>
              <td mat-cell *matCellDef="let m">{{ m.profile?.full_name || m.user_id }}</td>
            </ng-container>
            <ng-container matColumnDef="turn">
              <th mat-header-cell *matHeaderCellDef>Turn Month</th>
              <td mat-cell *matCellDef="let m">{{ m.turn_month }}</td>
            </ng-container>
            <ng-container matColumnDef="payment">
              <th mat-header-cell *matHeaderCellDef>Payment Details</th>
              <td mat-cell *matCellDef="let m">
                <span class="text-xs">IBAN: {{ m.iban || '-' }} · JazzCash: {{ m.jazzcash_number || '-' }} · Easypaisa: {{ m.easypaisa_number || '-' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="rating">
              <th mat-header-cell *matHeaderCellDef>Reputation</th>
              <td mat-cell *matCellDef="let m">★ {{ m.profile?.reputation_score ?? 0 }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let m">{{ m.status }}</td>
            </ng-container>
            <ng-container matColumnDef="paymentStatus">
              <th mat-header-cell *matHeaderCellDef>Current Month Payment</th>
              <td mat-cell *matCellDef="let m">{{ paymentStatusForMember(m.user_id) }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let m" class="space-x-2">
                <button mat-button class="!text-amber-700" (click)="prefillAssignment(m.id, m.slot_number, m.turn_month, m.iban, m.bank_name, m.jazzcash_number, m.easypaisa_number)">Edit</button>
                <button mat-button class="!text-red-600" (click)="removeMember(m.id)">Remove</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="!p-5">
          <h2 class="font-semibold mb-2">Add member by user search</h2>
          <form [formGroup]="addMemberForm" class="grid md:grid-cols-3 gap-3" (ngSubmit)="addMember()">
            <mat-form-field appearance="outline">
              <mat-label>Search user (name/phone)</mat-label>
              <input matInput formControlName="search" (input)="searchUsers()" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>User ID</mat-label>
              <input matInput formControlName="userId" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Slot #</mat-label>
              <input matInput type="number" formControlName="slotNumber" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Turn month</mat-label>
              <input matInput type="number" formControlName="turnMonth" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Bank name</mat-label>
              <input matInput formControlName="bankName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>IBAN</mat-label>
              <input matInput formControlName="iban" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>JazzCash</mat-label>
              <input matInput formControlName="jazzcash" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Easypaisa</mat-label>
              <input matInput formControlName="easypaisa" />
            </mat-form-field>
            <button mat-raised-button class="!bg-navy !text-white md:col-span-3" [disabled]="addMemberForm.invalid">Add Member</button>
          </form>
          @if (searchedUsers.length) {
            <div class="mt-3 space-y-2">
              @for (user of searchedUsers; track user.id) {
                <div class="p-2 rounded bg-slate-100 flex justify-between items-center">
                  <span>{{ user.full_name }} · {{ user.phone }} · ★{{ user.reputation_score }} · {{ user.badge }}</span>
                  <button mat-button (click)="selectUser(user.id)">Use</button>
                </div>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="!p-5">
          <h2 class="font-semibold mb-2">Invite by phone</h2>
          <form [formGroup]="inviteByPhoneForm" class="grid md:grid-cols-3 gap-3" (ngSubmit)="inviteByPhone()">
            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Slot #</mat-label>
              <input matInput type="number" formControlName="slotNumber" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Turn month</mat-label>
              <input matInput type="number" formControlName="turnMonth" />
            </mat-form-field>
            <button mat-raised-button class="!bg-amber-500 !text-white md:col-span-3" [disabled]="inviteByPhoneForm.invalid">Invite + Add</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="!p-5">
          <h2 class="font-semibold mb-2">Edit slot/turn/payment details</h2>
          <form [formGroup]="assignmentForm" class="grid md:grid-cols-4 gap-3" (ngSubmit)="updateAssignment()">
            <mat-form-field appearance="outline">
              <mat-label>Member record ID</mat-label>
              <input matInput formControlName="id" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Slot #</mat-label>
              <input matInput type="number" formControlName="slot_number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Turn month</mat-label>
              <input matInput type="number" formControlName="turn_month" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Bank name</mat-label>
              <input matInput formControlName="bank_name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>IBAN</mat-label>
              <input matInput formControlName="iban" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>JazzCash</mat-label>
              <input matInput formControlName="jazzcash_number" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Easypaisa</mat-label>
              <input matInput formControlName="easypaisa_number" />
            </mat-form-field>
            <button mat-raised-button class="!bg-navy !text-white md:col-span-4" [disabled]="assignmentForm.invalid">Save Assignment</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content class="!p-5">
          <h2 class="font-semibold mb-2">Join Requests</h2>
          @for (request of joinRequests; track request.id) {
            <div class="rounded-lg border p-3 mb-2">
              <p class="font-medium">{{ request.requester_profile?.full_name || request.requester_id }} · ★{{ request.requester_profile?.reputation_score ?? 0 }}</p>
              <p class="text-xs text-slate-500">Status: {{ request.status }}</p>
              <a class="text-xs text-amber-600" [routerLink]="['/profile', request.requester_id, 'public']">View public profile</a>
              @if (request.status === 'pending') {
                <div class="mt-2 flex gap-2">
                  <button mat-stroked-button (click)="approveRequest(request.id, request.requester_id)">Approve</button>
                  <button mat-button class="!text-red-600" (click)="rejectRequest(request.id, request.requester_id)">Reject</button>
                </div>
              }
            </div>
          } @empty {
            <p class="text-slate-500">No join requests.</p>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class CommitteeMembersComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly committeeService = inject(CommitteeService);
  private readonly paymentService = inject(PaymentService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  committeeId = '';
  members: Array<{
    id: string;
    user_id: string;
    slot_number: number;
    turn_month: number;
    iban: string | null;
    bank_name: string | null;
    jazzcash_number: string | null;
    easypaisa_number: string | null;
    status: string;
    profile: { full_name: string; avatar_url: string | null; reputation_score: number; badge: string } | null;
  }> = [];
  joinRequests: Array<{
    id: string;
    requester_id: string;
    status: 'pending' | 'approved' | 'rejected';
    requester_profile?: { full_name: string; phone: string; avatar_url: string | null; reputation_score: number; badge: string };
  }> = [];
  searchedUsers: Array<{ id: string; full_name: string; phone: string; avatar_url: string | null; reputation_score: number; badge: string }> = [];
  paymentStatusMap = new Map<string, string>();
  currentMonth = 1;

  readonly displayedColumns = ['slot', 'name', 'turn', 'payment', 'rating', 'status', 'paymentStatus', 'actions'];

  readonly addMemberForm = this.fb.group({
    search: [''],
    userId: ['', Validators.required],
    slotNumber: [2, [Validators.required, Validators.min(1)]],
    turnMonth: [1, [Validators.required, Validators.min(1)]],
    bankName: [''],
    iban: [''],
    jazzcash: [''],
    easypaisa: ['']
  });

  readonly inviteByPhoneForm = this.fb.group({
    phone: ['', Validators.required],
    slotNumber: [2, [Validators.required, Validators.min(1)]],
    turnMonth: [1, [Validators.required, Validators.min(1)]]
  });

  readonly assignmentForm = this.fb.group({
    id: ['', Validators.required],
    slot_number: [1, [Validators.required, Validators.min(1)]],
    turn_month: [1, [Validators.required, Validators.min(1)]],
    bank_name: [''],
    iban: [''],
    jazzcash_number: [''],
    easypaisa_number: ['']
  });

  constructor() {
    const committeeId = this.route.snapshot.paramMap.get('id');
    if (committeeId) {
      this.committeeId = committeeId;
      void this.load();
    }
  }

  async load(): Promise<void> {
    const [members, joinRequests, committee, payments] = await Promise.all([
      this.committeeService.getMembers(this.committeeId),
      this.committeeService.getJoinRequests(this.committeeId),
      this.committeeService.getCommitteeDetails(this.committeeId),
      this.paymentService.getCommitteePayments(this.committeeId)
    ]);
    this.members = members;
    this.joinRequests = joinRequests;
    this.currentMonth = this.calculateCurrentMonth(committee.start_date, committee.total_months);
    this.paymentStatusMap = new Map(
      this.members.map((member) => {
        const payment = payments.find((item) => item.member_id === member.user_id && item.month_number === this.currentMonth);
        const label = payment?.status === 'paid' ? 'Paid ✅' : payment?.status === 'overdue' ? 'Overdue ❌' : 'Pending ⏳';
        return [member.user_id, label];
      })
    );
  }

  async searchUsers(): Promise<void> {
    const term = this.addMemberForm.getRawValue().search?.trim() ?? '';
    if (term.length < 2) {
      this.searchedUsers = [];
      return;
    }
    this.searchedUsers = await this.committeeService.searchRegisteredUsers(term);
  }

  selectUser(userId: string): void {
    this.addMemberForm.patchValue({ userId });
  }

  async addMember(): Promise<void> {
    if (this.addMemberForm.invalid) return;
    const value = this.addMemberForm.getRawValue();
    try {
      await this.committeeService.addMemberToCommittee({
        committeeId: this.committeeId,
        userId: value.userId!,
        slotNumber: value.slotNumber!,
        turnMonth: value.turnMonth!,
        iban: value.iban || undefined,
        bankName: value.bankName || undefined,
        jazzcashNumber: value.jazzcash || undefined,
        easypaisaNumber: value.easypaisa || undefined
      });
      this.toastr.success('Member added');
      await this.load();
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }

  async inviteByPhone(): Promise<void> {
    if (this.inviteByPhoneForm.invalid) return;
    const value = this.inviteByPhoneForm.getRawValue();
    try {
      await this.committeeService.inviteByPhone(this.committeeId, value.phone!, value.slotNumber!, value.turnMonth!);
      this.toastr.success('Member invited and added');
      await this.load();
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }

  prefillAssignment(
    id: string,
    slot: number,
    turn: number,
    iban: string | null,
    bankName: string | null,
    jazzcash: string | null,
    easypaisa: string | null
  ): void {
    this.assignmentForm.patchValue({
      id,
      slot_number: slot,
      turn_month: turn,
      iban: iban ?? '',
      bank_name: bankName ?? '',
      jazzcash_number: jazzcash ?? '',
      easypaisa_number: easypaisa ?? ''
    });
  }

  async updateAssignment(): Promise<void> {
    if (this.assignmentForm.invalid) return;
    const value = this.assignmentForm.getRawValue();
    try {
      await this.committeeService.updateMemberAssignment(value.id!, {
        slot_number: value.slot_number!,
        turn_month: value.turn_month!,
        iban: value.iban || null,
        bank_name: value.bank_name || null,
        jazzcash_number: value.jazzcash_number || null,
        easypaisa_number: value.easypaisa_number || null
      });
      this.toastr.success('Assignment updated');
      await this.load();
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }

  async removeMember(committeeMemberId: string): Promise<void> {
    try {
      await this.committeeService.removeMemberBeforeActivation(committeeMemberId);
      this.toastr.success('Member removed');
      await this.load();
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }

  async approveRequest(requestId: string, requesterId: string): Promise<void> {
    const nextSlot = this.members.filter((member) => member.status === 'active').length + 1;
    const nextTurn = nextSlot;
    try {
      await this.committeeService.reviewJoinRequest({
        requestId,
        committeeId: this.committeeId,
        requesterId,
        approve: true,
        slotNumber: nextSlot,
        turnMonth: nextTurn
      });
      this.toastr.success('Join request approved');
      await this.load();
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }

  async rejectRequest(requestId: string, requesterId: string): Promise<void> {
    try {
      await this.committeeService.reviewJoinRequest({
        requestId,
        committeeId: this.committeeId,
        requesterId,
        approve: false
      });
      this.toastr.info('Join request rejected');
      await this.load();
    } catch (error) {
      this.toastr.error((error as Error).message);
    }
  }

  paymentStatusForMember(userId: string): string {
    return this.paymentStatusMap.get(userId) ?? 'Pending ⏳';
  }

  private calculateCurrentMonth(startDate: string, totalMonths: number): number {
    const start = new Date(startDate);
    const now = new Date();
    if (Number.isNaN(start.getTime()) || now < start) return 1;
    const monthDiff = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth() + 1;
    return Math.max(1, Math.min(totalMonths, monthDiff));
  }
}
