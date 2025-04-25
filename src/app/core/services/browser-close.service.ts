import { HostListener, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserCloseService {

  private needLogout: boolean = true;

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent): boolean | void {
    if (this.needLogout) {
      localStorage.clear()
      return true
    }

  }

   setNeedLogout(value: boolean): void {
    this.needLogout = value;
  }
}
