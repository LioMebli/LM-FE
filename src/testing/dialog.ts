export function giveJsdomTheDialogMethods(): void {
  const dialog = HTMLDialogElement.prototype as HTMLDialogElement;

  dialog.showModal ??= function (this: HTMLDialogElement) {
    if (this.hasAttribute('open')) {
      throw new DOMException('The element already has an "open" attribute', 'InvalidStateError');
    }

    this.setAttribute('open', '');
  };

  dialog.close ??= function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) {
      return;
    }

    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
