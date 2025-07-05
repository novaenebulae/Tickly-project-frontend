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
    // Calculer le début de la semaine (lundi)
    const startDate: Date = new Date(date.getTime());
    const dayOfWeek = startDate.getDay();
    // getDay() retourne 0 pour dimanche, 1 pour lundi, etc.
    // On veut que lundi soit le jour 0, donc on ajuste
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Calculer la fin de la semaine (dimanche)
    const endDate: Date = new Date(startDate.getTime());
    endDate.setDate(startDate.getDate() + 6);

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
