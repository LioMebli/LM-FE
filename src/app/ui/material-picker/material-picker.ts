import { Component, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { Photograph } from '../media.types';

export interface Material {
  name: string;
  summary: string;
  detail: string;
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

  protected readonly selected = signal(0);

  protected choose(index: number): void {
    this.selected.set(index);
  }
}
