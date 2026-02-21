import { Injectable, OnDestroy, signal } from '@angular/core';

export interface PopupMessage {
  type: 'UPDATE_TEXT' | 'UPDATE_COLOR' | 'POPUP_CLOSED';
  value?: string;
}

/**
 * Service that manages a cross-window control panel using window.postMessage.
 * This replicates the html-popup POC pattern inside an Angular injectable service.
 */
@Injectable({ providedIn: 'root' })
export class PopupService implements OnDestroy {
  readonly text = signal('');
  readonly color = signal('#000000');
  readonly isOpen = signal(false);

  private popup: Window | null = null;
  private readonly messageHandler = (event: MessageEvent<PopupMessage>) => {
    // For production use, restrict to a known origin, e.g.:
    //   if (event.origin !== 'https://your-app.example.com') return;
    // This POC accepts any origin because the popup is served from the same local server.
    const { type, value = '' } = event.data ?? {};
    if (type === 'UPDATE_TEXT') this.text.set(value);
    if (type === 'UPDATE_COLOR') this.color.set(value);
    if (type === 'POPUP_CLOSED') {
      this.isOpen.set(false);
      this.popup = null;
    }
  };

  constructor() {
    window.addEventListener('message', this.messageHandler);
  }

  openPopup(popupUrl: string): void {
    this.popup = window.open(popupUrl, 'ControlPanel',
      'width=420,height=380,location=no,menubar=no,toolbar=no');
    if (this.popup) this.isOpen.set(true);
  }

  closePopup(): void {
    if (this.popup && !this.popup.closed) {
      // Use '*' as targetOrigin here because popup.html is a same-origin static asset.
      // In production, replace '*' with the specific window origin.
      this.popup.postMessage({ type: 'POPUP_CLOSED' }, '*');
      this.popup.close();
    }
    this.isOpen.set(false);
    this.popup = null;
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.closePopup();
  }
}
