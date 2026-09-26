import { Component, computed, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { Photograph } from '../media.types';

export interface Material {
  name: string;
  summary: string;
  detail: string;
  wideDetail?: string;
  image?: Photograph;
}

@Component({
  selector: 'app-material-picker',
  imports: [NgOptimizedImage],
  templateUrl: './material-picker.html',
  styleUrl: './material-picker.scss',
})
export class MaterialPicker {
  readonly materials = input.required<readonly Material[]>();

  private readonly picked = signal<number | null>(null);

  protected readonly selected = computed(
    () => this.picked() ?? Math.floor(this.materials().length / 2),
  );

  protected choose(index: number): void {
    this.picked.set(index);
  }
}
