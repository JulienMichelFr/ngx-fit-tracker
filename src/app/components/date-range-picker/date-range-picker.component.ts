import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { distinctUntilChanged, skipWhile } from 'rxjs/operators';
import {
  endOfMonth,
  endOfWeek,
  fromUnixTime,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks
} from 'date-fns';

enum RangeEnum {
  LAST_10 = 'last10',
  LAST_30 = 'last30',
  CURRENT_WEEK = 'currentWeek',
  LAST_WEEK = 'lastWeek',
  CURRENT_MONTH = 'currentMonth',
  LAST_MONTH = 'lastMonth',
  SINCE_START = 'sinceStart'
}

interface CustomRange {
  id: RangeEnum;
  label: string;
}

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() start: Date;
  @Input() end: Date;

  @Output() rangeChange = new EventEmitter<{ start: Date; end: Date }>();

  form: FormGroup;
  maxDate = new Date();
  ranges: CustomRange[] = [
    {
      id: RangeEnum.LAST_10,
      label: '10 jours'
    },
    {
      id: RangeEnum.LAST_30,
      label: '30 jours'
    },
    {
      id: RangeEnum.CURRENT_WEEK,
      label: 'Semaine en cours'
    },
    {
      id: RangeEnum.LAST_WEEK,
      label: 'Semaine dernière'
    },
    {
      id: RangeEnum.CURRENT_MONTH,
      label: 'Mois en cours'
    },
    {
      id: RangeEnum.LAST_MONTH,
      label: 'Mois dernier'
    },
    {
      id: RangeEnum.SINCE_START,
      label: 'Depuis le début'
    }
  ];

  private sink = new SubSink();

  constructor() {
    this.form = new FormGroup({
      start: new FormControl(this.start, [Validators.required]),
      end: new FormControl(this.end, [Validators.required])
    });
  }

  ngOnInit() {
    this.sink.add(
      this.form.valueChanges
        .pipe(
          skipWhile(() => this.form.invalid),
          distinctUntilChanged()
        )
        .subscribe(value => {
          this.rangeChange.emit(value);
        })
    );
  }

  ngOnDestroy(): void {
    this.sink.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.start && changes.start.currentValue) {
      this.form.patchValue(
        { start: changes.start.currentValue },
        { emitEvent: false }
      );
    }
    if (changes.end && changes.end.currentValue) {
      this.form.patchValue(
        { end: changes.end.currentValue },
        { emitEvent: false }
      );
    }
  }

  selectRange(range: CustomRange) {
    let result: { start: Date; end: Date };
    switch (range.id) {
      case RangeEnum.LAST_10:
        result = { start: subDays(new Date(), 10), end: new Date() };
        break;
      case RangeEnum.LAST_30:
        result = { start: subDays(new Date(), 30), end: new Date() };
        break;
      case RangeEnum.CURRENT_WEEK:
        result = { start: startOfWeek(new Date()), end: endOfWeek(new Date()) };
        break;
      case RangeEnum.LAST_WEEK:
        result = {
          start: startOfWeek(subWeeks(new Date(), 1)),
          end: endOfWeek(subWeeks(new Date(), 1))
        };
        break;
      case RangeEnum.CURRENT_MONTH:
        result = {
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date())
        };
        break;
      case RangeEnum.LAST_MONTH:
        result = {
          start: startOfMonth(subMonths(new Date(), 1)),
          end: endOfMonth(subMonths(new Date(), 1))
        };
        break;
      case RangeEnum.SINCE_START:
        result = { start: fromUnixTime(0), end: new Date() };
        break;
    }
    if (!result) {
      return;
    }
    this.form.patchValue(result);
  }
}
