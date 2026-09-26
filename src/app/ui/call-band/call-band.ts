import { Component, computed, input } from '@angular/core';

import { telHref } from '../../core/site-contact';

@Component({
  selector: 'app-call-band',
  imports: [],
  templateUrl: './call-band.html',
  styleUrl: './call-band.scss',
})
export class CallBand {
  readonly heading = input.required<string>();

  readonly lede = input.required<string>();

  readonly phone = input.required<string>();

  readonly hours = input<string>();

  protected readonly callHref = computed(() => telHref(this.phone()));
}
