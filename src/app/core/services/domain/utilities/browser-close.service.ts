/**
 * @file Service to handle actions when the browser tab/window is about to be closed.
 * Primarily used to clear session-specific authentication data if the user
 * did not choose to "keep logged in".
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { HostListener, Injectable, inject } from '@angular/core';
import { AuthService } from '../user/auth.service'; // Import AuthService

/**
 * Service that listens to the `beforeunload` event of the window.
 * It can be configured to perform cleanup actions, such as logging out a user
 * if their session is not meant to be persisted.
 */
@Injectable({
  providedIn: 'root'
})
export class BrowserCloseService {
  private authService = inject(AuthService);

  /**
   * Flag to control whether the logout logic should be executed on `beforeunload`.
   * Defaults to `true`. Can be set to `false` programmatically if, for example,
   * a specific navigation is occurring that should not trigger this logout.
   */
  private performCleanupOnClose: boolean = true;

  /**
   * HostListener for the 'window:beforeunload' event.
   * This method is called just before the user navigates away from the page
   * or closes the tab/window.
   *
   * @param event - The `BeforeUnloadEvent` object.
   * @returns It can return a string to prompt the user with a confirmation dialog,
   *          but in this case, we are using it for cleanup and not for prompting.
   *          Returning `true` or `void` (or nothing) typically allows the unload without a prompt.
   *          Note: Modern browsers have restrictions on custom messages for `beforeunload`.
   */
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent): void { // Return type can be void if no prompt is needed
    if (this.performCleanupOnClose) {
      // Call AuthService to clear session data only if "keep me logged in" was not selected.
      this.authService.clearSessionDataIfNotKeptLoggedIn();

      // localStorage.clear(); // AVOID: This clears everything in localStorage.
      // The original code returned `true` which is not standard for `beforeunload`
      // if you don't want to show a prompt. Modern browsers often ignore the return value
      // for preventing navigation unless user interaction has occurred.
      // If you want to show a confirmation message (browser-dependent):
      // event.preventDefault(); // Standard way to try and trigger prompt
      // event.returnValue = 'Êtes-vous sûr de vouloir quitter ? Vos modifications non sauvegardées pourraient être perdues.';
      // return 'Êtes-vous sûr de vouloir quitter ?'; // Legacy way
    }
  }

  /**
   * Allows other parts of the application to enable or disable the cleanup logic
   * executed on browser close.
   * For example, disable it temporarily during a specific in-app navigation flow
   * where `beforeunload` might be triggered but logout is not desired.
   *
   * @param performCleanup - Set to `true` to enable cleanup on close, `false` to disable.
   */
  public setPerformCleanupOnClose(performCleanup: boolean): void {
    this.performCleanupOnClose = performCleanup;
    if (performCleanup) {
      console.log('BrowserCloseService: Cleanup on close is ENABLED.');
    } else {
      console.log('BrowserCloseService: Cleanup on close is DISABLED.');
    }
  }
}
