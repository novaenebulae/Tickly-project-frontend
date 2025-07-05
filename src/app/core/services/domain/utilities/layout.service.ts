/**
 * @file Service for observing and providing information about the current viewport layout.
 * Useful for adapting UI components based on screen size (e.g., mobile vs. desktop).
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {inject, Injectable, Signal} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators'; // Corrected import for 'map'
import {toSignal} from '@angular/core/rxjs-interop';

/**
 * Service that provides signals indicating the current viewport state,
 * particularly for differentiating between desktop-like and mobile-like layouts.
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private breakpointObserver = inject(BreakpointObserver);

  /**
   * A signal that emits `true` if the current viewport matches desktop-like breakpoints
   * (Large, XLarge, Medium), and `false` otherwise.
   * This allows components to reactively adapt their layout or behavior.
   *
   * Example Breakpoints (from Angular Material CDK):
   * - XSmall: (max-width: 599.98px)
   * - Small: (min-width: 600px) and (max-width: 959.98px)
   * - Medium: (min-width: 960px) and (max-width: 1279.98px)
   * - Large: (min-width: 1280px) and (max-width: 1919.98px)
   * - XLarge: (min-width: 1920px)
   */
  public readonly isDesktop: Signal<boolean> = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Large, Breakpoints.XLarge, Breakpoints.Medium]) // Observing typical desktop breakpoints
      .pipe(
        map((result) => result.matches) // Emits true if any of these breakpoints match
      ),
    { initialValue: this.getInitialDesktopValue() } // Set a reasonable initial value
  );

  /**
   * Helper to determine initial desktop value without waiting for observer.
   * This can prevent layout shifts on initial load for SSR or fast rendering.
   */
  private getInitialDesktopValue(): boolean {
    // Consider typical desktop widths. This is a heuristic.
    // Breakpoints.Medium starts at 960px.
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 960;
    }
    return true; // Default to desktop for SSR or unknown environments, adjust as needed
  }
}
