import {CalendarDateFormatter, DateFormatterParams} from 'angular-calendar';
import {formatDate} from '@angular/common';
import {Injectable} from '@angular/core';

@Injectable()
export class CustomDateFormatter extends CalendarDateFormatter {

  public override dayViewHour({date, locale}: DateFormatterParams): string {
    return formatDate(date, 'HH:mm', <string>locale);
  }

  public override weekViewHour({date, locale}: DateFormatterParams): string {
    return this.dayViewHour({date, locale});
  }

  public override dayViewTitle({date, locale}: DateFormatterParams): string {
    return formatDate(date, 'EEEE d MMMM y', <string>locale).toLowerCase().split(' ').map((word: any) => {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }

  public override monthViewTitle({date, locale}: DateFormatterParams): string {
    return formatDate(date, 'MMMM y', <string>locale).toLowerCase().split(' ').map((word: any) => {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }

  public override weekViewTitle({ date, locale }: DateFormatterParams): string {
    const startDate: Date = new Date(date.getTime());
    const endDate: Date = new Date(date.getTime());
    startDate.setDate(startDate.getDate());
    endDate.setDate(endDate.getDate() + 6);

    return (formatDate(startDate, 'd MMMM', <string>locale) +
      ' - ' +
      formatDate(endDate, 'd MMMM', <string>locale) +
      ', ' +
      formatDate(date, 'y', <string>locale))
      .toLowerCase()
      .split(' ')
      .map((word: any) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      }).join(' ');
  }

}
