import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { Chart } from 'chart.js';
import { AngularFireAuth } from '@angular/fire/auth';
import { DBWeight, Stats, Weight } from './models';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { auditTime, map, startWith, tap, throttleTime } from 'rxjs/operators';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;
import { SubSink } from 'subsink';
import { SwUpdate } from '@angular/service-worker';
import { startOfDay, endOfDay, subDays } from 'date-fns';

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
  stats$: Observable<Stats>;
  hasValueToday$: Observable<boolean>;
  startDate = startOfDay(subDays(new Date(), 10));
  endDate = endOfDay(new Date());

  constructor(
    public afAuth: AngularFireAuth,
    private afStore: AngularFirestore,
    private swUpdate: SwUpdate
  ) {
    this.collection = afStore.collection<DBWeight>('weight', (ref => ref.orderBy('date')));
    this.data$ = this.collection.valueChanges().pipe(
      map((value: DBWeight[]) => {
        return value.map((v): Weight => {
          return { value: v.value, date: (v.date as unknown as Timestamp).toDate() };
        });
      })
    );
    this.startSubject.next(this.startDate);
    this.endSubject.next(this.endDate);
  }

  ngOnInit(): void {
    this.last10$ = combineLatest(
      this.startSubject.asObservable().pipe(startWith(this.startDate)),
      this.endSubject.asObservable().pipe(startWith(this.endDate)),
      this.data$).pipe(
      auditTime(1000),
      map(([start, end, values]) => {
        console.log('called', {start: start.toDateString(), end: end.toDateString()});
        return values.filter((v) => {
          return endOfDay(v.date) > start && v.date < endOfDay(end)
        });
      }));

    this.last10Avg$ = this.last10$.pipe(
      map((values: Weight[]) => {
        return (
          Math.round(
            (values.reduce((acc, value: any) => acc + value.value, 0) / values.length) *
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
    this.stats$ = combineLatest(this.last10Avg$, this.last10Diff$).pipe(
      map(([avg, diff]): Stats => {
        return {
          difference: diff,
          average: avg
        };
      })
    );

    this.hasValueToday$ = this.data$.pipe(
      map((values) => {
        return !!values.find(({ date }) => date.toDateString() === new Date().toDateString()
        );
      })
    );

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('Une mise à jour est disponible. Voulez-vous l\'installer ?')) {
          window.location.reload();
        }
      });
    }

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  addValue(weight: Weight) {
    const { uid } = this.afAuth.auth.currentUser;
    this.collection.add({ value: weight.value, date: Timestamp.fromDate(weight.date), user: uid });
  }

  signIn({ login, password }: { login: string; password: string }) {
    this.afAuth.auth.signInWithEmailAndPassword(login, password);
  }

  dateChange({ start, end }: { start: Date, end: Date }) {
    console.log('changed');
    this.startDate = start;
    this.endDate = end;
    this.startSubject.next(start);
    this.endSubject.next(end);
  }
}
