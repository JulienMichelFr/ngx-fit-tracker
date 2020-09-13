import { Component, OnInit } from '@angular/core';
import { WeightService } from '../../services/weight/weight.service';
import { combineLatest, Observable, Subject } from 'rxjs';
import { Stats, Weight } from '../../models';
import { compareAsc, endOfDay, startOfDay, subDays } from 'date-fns';
import { auditTime, map, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {
  private startSubject = new Subject<Date>();
  private endSubject = new Subject<Date>();
  public data$: Observable<Weight[]>;
  public last10$: Observable<Weight[]>;
  public last10Avg$: Observable<number>;
  public last10Diff$: Observable<number>;
  public min$: Observable<Weight>;
  public max$: Observable<Weight>;
  public current$: Observable<number>;
  public stats$: Observable<Stats>;
  public hasValueToday$: Observable<boolean>;
  public startDate = startOfDay(subDays(new Date(), 10));
  public endDate = endOfDay(new Date());

  constructor(private weightService: WeightService) {}

  ngOnInit(): void {
    this.data$ = this.weightService.getWeights();

    this.last10$ = combineLatest([
      this.startSubject.asObservable().pipe(startWith(this.startDate)),
      this.endSubject.asObservable().pipe(startWith(this.endDate)),
      this.data$
    ]).pipe(
      auditTime(1000),
      map(([start, end, values]) => {
        return values.filter(v => {
          return endOfDay(v.date) > start && v.date < endOfDay(end);
        });
      })
    );

    this.last10Avg$ = this.last10$.pipe(
      map((values: Weight[]) => {
        return (
          Math.round(
            (values.reduce((acc, value: any) => acc + value.value, 0) /
              values.length) *
              100
          ) / 100
        );
      })
    );
    this.last10Diff$ = this.last10$.pipe(
      map((values: Weight[]) => {
        if (!values.length) {
          return 0;
        }
        const [first] = values;
        const [last] = values.reverse();
        return Math.round((last.value - first.value) * 100) / 100;
      })
    );

    this.max$ = this.data$.pipe(
      map(values =>
        values.reduce((acc, v): Weight => {
          if (!acc) {
            return v;
          }
          if (v.value > acc.value) {
            return v;
          }
          return acc;
        }, null)
      )
    );

    this.min$ = this.data$.pipe(
      map(values =>
        values.reduce((acc, v): Weight => {
          if (!acc) {
            return v;
          }
          if (v.value < acc.value) {
            return v;
          }
          return acc;
        }, null)
      )
    );

    this.current$ = this.data$.pipe(
      map(values => {
        const [first] = values
          .sort((a, b) => compareAsc(a.value, b.value))
          .map(v => v.value);
        return first;
      })
    );

    this.stats$ = combineLatest([
      this.last10Avg$,
      this.last10Diff$,
      this.min$,
      this.max$,
      this.current$
    ]).pipe(
      map(
        ([avg, diff, min, max, current]): Stats => {
          return {
            difference: diff,
            average: avg,
            min,
            max,
            current
          };
        }
      )
    );

    this.hasValueToday$ = this.data$.pipe(
      map(values => {
        return !!values.find(
          ({ date }) => date.toDateString() === new Date().toDateString()
        );
      })
    );

    this.startSubject.next(this.startDate);
    this.endSubject.next(this.endDate);
  }

  dateChange({ start, end }: { start: Date; end: Date }) {
    this.startDate = start;
    this.endDate = end;
    this.startSubject.next(start);
    this.endSubject.next(end);
  }

  addValue(weight: Weight) {
    return this.weightService.addWeight(weight);
  }
}
