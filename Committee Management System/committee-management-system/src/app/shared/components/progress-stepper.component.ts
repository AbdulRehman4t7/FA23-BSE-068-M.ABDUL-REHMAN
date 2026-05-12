import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule, MatStepperModule],
  template: `
    <div class="flex items-center justify-between">
      @for (step of steps; track $index) {
        <div class="flex items-center">
          <div [class]="getStepClass($index)" class="w-10 h-10 rounded-full flex items-center justify-center font-semibold">
            {{ $index + 1 }}
          </div>
          @if ($index < steps.length - 1) {
            <div [class]="getLineClass($index)" class="w-16 h-1 mx-2"></div>
          }
        </div>
      }
    </div>
  `
})
export class ProgressStepperComponent {
  @Input() steps: string[] = [];
  @Input() currentStep: number = 0;

  getStepClass(index: number): string {
    if (index < this.currentStep) return 'bg-green-500 text-white';
    if (index === this.currentStep) return 'bg-amber-500 text-white';
    return 'bg-gray-300 text-gray-600';
  }

  getLineClass(index: number): string {
    return index < this.currentStep ? 'bg-green-500' : 'bg-gray-300';
  }
}
