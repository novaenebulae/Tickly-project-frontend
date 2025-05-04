import {Component} from '@angular/core';
import 'zone.js';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarWeekViewBeforeRenderEvent,
  CalendarDayViewBeforeRenderEvent,
  CalendarModule,
  DateAdapter, CalendarView, DAYS_OF_WEEK, CalendarDateFormatter,
} from 'angular-calendar';
import {Subject} from 'rxjs';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {CommonModule} from '@angular/common';
import {isSameDay, isSameMonth} from 'date-fns';
import {CustomDateFormatter} from '../../../../../../core/providers/date-formatter.provider';

@Component({
  selector: 'app-event-calendar',
  imports: [
    CalendarModule,
    CommonModule,
  ],
  templateUrl: './event-calendar.component.html',
  styleUrl: './event-calendar.component.scss',
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
})
export class EventCalendarComponent {
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView;

  events: CalendarEvent[] = [];

  activeDayIsOpen = false;

  dayStartHour = 9;

  locale: string = 'fr';

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];

  constructor() {

    const event1 = {
      title: 'Concert',
      start: new Date("2025-05-05T10:00"),
      end: new Date("2025-05-05T12:00"),
    }

    const event2 = {
      title: 'Concert',
      start: new Date("2025-05-05T20:30"),
      end: new Date("2025-05-05T23:00"),
    }

    const event3 = {
      title: 'Concert',
      start: new Date("2025-05-04T10:00"),
      end: new Date("2025-05-04T16:00"),
    }

    this.events.push(event1, event2, event3);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked({date, events}: { date: Date, events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;

    }
  }
}
