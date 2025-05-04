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

  public override weekViewTitle({date, locale}: DateFormatterParams): string {
    return (formatDate(date.setDate(date.getDate() + 1), 'd MMMM', <string>locale)
      + ' - '
      + formatDate(date.setDate(date.getDate() + 7), 'd MMMM', <string>locale)
      + ', ' + formatDate(date, 'y', <string>locale))
      .toLowerCase()
      .split(' ')
      .map((word: any) => {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }

}
