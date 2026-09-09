import { Component, input } from '@angular/core';

export interface ProcessStep {
  label: string;
  detail: string;
}

@Component({
  selector: 'app-process-steps',
  imports: [],
  templateUrl: './process-steps.html',
  styleUrl: './process-steps.scss',
})
export class ProcessSteps {
  readonly steps = input.required<readonly ProcessStep[]>();
}
