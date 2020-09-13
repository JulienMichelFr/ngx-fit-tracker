import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { DBWeight, Stats, Weight } from './models';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { combineLatest, Observable, Subject } from 'rxjs';
import { auditTime, map, startWith } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import { SubSink } from 'subsink';
import { SwUpdate } from '@angular/service-worker';
import { compareAsc, endOfDay, startOfDay, subDays } from 'date-fns';
import Timestamp = firestore.Timestamp;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  private collection: AngularFirestoreCollection<DBWeight>;
  private startSubject = new Subject<Date>();
  private endSubject = new Subject<Date>();

  data$: Observable<Weight[]>;
  last10$: Observable<Weight[]>;
  last10Avg$: Observable<number>;
  last10Diff$: Observable<number>;
  min$: Observable<Weight>;
  max$: Observable<Weight>;
  current$: Observable<number>;
  stats$: Observable<Stats>;
  hasValueToday$: Observable<boolean>;
  startDate = startOfDay(subDays(new Date(), 10));
  endDate = endOfDay(new Date());

  constructor(
    public afAuth: AngularFireAuth,
    private afStore: AngularFirestore,
    private swUpdate: SwUpdate
  ) {
    this.collection = afStore.collection<DBWeight>('weight', ref =>
      ref.orderBy('date')
    );
    this.data$ = this.collection.valueChanges().pipe(
      map((value: DBWeight[]) => {
        return value.map(
          (v): Weight => {
            return {
              value: v.value,
              date: ((v.date as unknown) as Timestamp).toDate()
            };
          }
        );
      })
    );
    this.startSubject.next(this.startDate);
    this.endSubject.next(this.endDate);
  }

  ngOnInit(): void {
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

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (
          confirm("Une mise à jour est disponible. Voulez-vous l'installer ?")
        ) {
          window.location.reload();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async addValue(weight: Weight) {
    const { uid } = await this.afAuth.currentUser;
    await this.collection.add({
      value: weight.value,
      date: Timestamp.fromDate(weight.date),
      user: uid
    });
  }

  dateChange({ start, end }: { start: Date; end: Date }) {
    console.log('changed');
    this.startDate = start;
    this.endDate = end;
    this.startSubject.next(start);
    this.endSubject.next(end);
  }
}
