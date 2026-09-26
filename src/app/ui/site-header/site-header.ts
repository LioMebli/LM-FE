import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { telHref } from '../../core/site-contact';
import { NavDestination } from '../shell.types';
import { BrandMark } from '../brand-mark/brand-mark';

const SWIPE_AWAY = 56;

@Component({
  selector: 'app-site-header',
  imports: [BrandMark, RouterLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  readonly destinations = input.required<readonly NavDestination[]>();

  readonly phone = input<string>();

  readonly selectionCount = input<number>();

  readonly searched = output<string>();

  protected readonly callHref = computed(() => telHref(this.phone()));

  protected readonly searchOpen = signal(false);

  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');

  private readonly headerField = viewChild<ElementRef<HTMLInputElement>>('headerField');

  private touchStart: { x: number; y: number } | null = null;

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

  protected closeWhenOutside(event: MouseEvent): void {
    const panel = this.menu().nativeElement.getBoundingClientRect();
    const inside =
      event.clientX >= panel.left &&
      event.clientX <= panel.right &&
      event.clientY >= panel.top &&
      event.clientY <= panel.bottom;

    if (!inside) {
      this.close();
    }
  }

  protected rememberTouch(event: PointerEvent): void {
    this.touchStart = { x: event.clientX, y: event.clientY };
  }

  protected closeWhenSwipedAway(event: PointerEvent): void {
    const start = this.touchStart;
    this.touchStart = null;

    if (!start) {
      return;
    }

    const travelled = event.clientX - start.x;

    if (travelled >= SWIPE_AWAY && travelled > Math.abs(event.clientY - start.y)) {
      this.close();
    }
  }

  protected submitSearch(event: Event, query: string): void {
    event.preventDefault();

    const asked = query.trim();

    if (asked) {
      this.searched.emit(asked);
    }
  }
}
