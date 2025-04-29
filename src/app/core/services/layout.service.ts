import { Injectable, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private breakpointObserver = inject(BreakpointObserver);

  isDesktop = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Large, Breakpoints.XLarge, Breakpoints.Medium])
      .pipe(map((result) => result.matches)),
    { initialValue: false }
  );
}
