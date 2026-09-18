import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { telHref } from '../../core/site-contact';
import { NavDestination } from '../shell.types';
import { ActionButton } from '../action-button/action-button';
import { BrandMark } from '../brand-mark/brand-mark';
import { SelectionLink } from '../selection-link/selection-link';

@Component({
  selector: 'app-site-header',
  imports: [ActionButton, BrandMark, NgTemplateOutlet, RouterLink, SelectionLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  readonly destinations = input.required<readonly NavDestination[]>();

  readonly phone = input<string>();

  readonly selectionCount = input<number>();

  readonly selectionLink = input<string>();

  readonly searched = output<string>();

  protected readonly callHref = computed(() => telHref(this.phone()));

  protected readonly searchOpen = signal(false);

  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');

  private readonly headerField = viewChild<ElementRef<HTMLInputElement>>('headerField');

  protected toggleSearch(): void {
    this.searchOpen.update((open) => !open);
    this.headerField()?.nativeElement.focus();
  }

  protected closeSearchWhenEmpty(value: string): void {
    if (!value.trim()) {
      this.searchOpen.set(false);
    }
  }

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
