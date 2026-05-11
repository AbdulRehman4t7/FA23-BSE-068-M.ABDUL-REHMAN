import { Component, Input } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [MatStepperModule],
  template: `
    <mat-stepper [selectedIndex]="currentMonth - 1">
      @for (name of monthOwners; track $index) {
        <mat-step [label]="'Month ' + ($index + 1)">
          <p class="text-slate-700">Payout member: <strong>{{ name }}</strong></p>
        </mat-step>
      }
    </mat-stepper>
  `
})
export class ProgressStepperComponent {
  @Input() currentMonth = 1;
  @Input() monthOwners: string[] = [];
}
