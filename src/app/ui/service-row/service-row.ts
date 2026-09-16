import { Component, input } from '@angular/core';

export interface Service {
  name: string;
  detail: string;
}

@Component({
  selector: 'app-service-row',
  imports: [],
  templateUrl: './service-row.html',
  styleUrl: './service-row.scss',
})
export class ServiceRow {
  readonly services = input.required<readonly Service[]>();
}
