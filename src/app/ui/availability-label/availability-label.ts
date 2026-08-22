import { Component, computed, input } from '@angular/core';

import { AVAILABILITY_LABELS, Availability } from '../../core/api/catalog.types';

@Component({
  selector: 'app-availability-label',
  templateUrl: './availability-label.html',
  styleUrl: './availability-label.scss',
})
export class AvailabilityLabel {
  readonly availability = input.required<Availability>();

  protected readonly text = computed(() => AVAILABILITY_LABELS[this.availability()]);
}
