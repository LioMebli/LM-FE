export function giveJsdomTheDialogMethods(): void {
  const dialog = HTMLDialogElement.prototype as HTMLDialogElement;

  dialog.showModal ??= function (this: HTMLDialogElement) {
    if (this.hasAttribute('open')) {
      return;
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
