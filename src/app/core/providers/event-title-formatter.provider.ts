import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {CalendarEvent, CalendarEventTitleFormatter} from 'angular-calendar';
import {formatDate} from '@angular/common';

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  override month(event: CalendarEvent): string {
    return `<b>${formatDate(event.start, 'HH:mm', this.locale)} </b> ${
      event.title
    }`;
  }

  override week(event: CalendarEvent): string {
    return `<b>${formatDate(event.start, 'HH:mm', this.locale)} </b> ${
      event.title
    }`;
  }

  override day(event: CalendarEvent): string {
    return `<b>${formatDate(event.start, 'HH:mm', this.locale)} </b> ${
      event.title
    }`;
  }
}
