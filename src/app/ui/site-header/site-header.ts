import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavDestination } from '../shell.types';
import { ActionButton } from '../action-button/action-button';
import { BrandMark } from '../brand-mark/brand-mark';

@Component({
  selector: 'app-site-header',
  imports: [ActionButton, BrandMark, RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  readonly destinations = input.required<readonly NavDestination[]>();

  readonly searched = output<string>();

  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');

  protected open(): void {
    this.menu().nativeElement.showModal();
  }

  protected close(): void {
    this.menu().nativeElement.close();
  }

  protected submitSearch(event: Event, query: string): void {
    event.preventDefault();

    const asked = query.trim();

    if (asked) {
      this.searched.emit(asked);
    }
  }
}
