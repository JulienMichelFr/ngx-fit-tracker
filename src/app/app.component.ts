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
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;
import { SubSink } from 'subsink';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  private collection: AngularFirestoreCollection<DBWeight>;
  data$: Observable<Weight[]>;
  last10$: Observable<Weight[]>;
  last10Avg$: Observable<number>;
  last10Diff$: Observable<number>;
  stats$: Observable<Stats>;
  hasValueToday$: Observable<boolean>;

  constructor(
    private afAuth: AngularFireAuth,
    private afStore: AngularFirestore
  ) {
    this.collection = afStore.collection<DBWeight>('weight', (ref => ref.orderBy('date')));
    this.data$ = this.collection.valueChanges().pipe(
      map((value: DBWeight[]) => {
        return value.map((v): Weight => {
          return { value: v.value, date: (v.date as unknown as Timestamp).toDate() };
        });
      })
    );
  }

  ngOnInit(): void {
    this.last10$ = this.data$.pipe(map((values) => {
      if (values.length <= 10) {
        return values
      }
      return [...values].slice(Math.max([...values].length - 10, 1));
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
          return 0
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
        )
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }

  addValue(weight: Weight) {
    const {uid} = this.afAuth.auth.currentUser;
    this.collection.add({ value: weight.value, date: Timestamp.fromDate(weight.date), user: uid});
  }

  signIn({ login, password }: { login: string; password: string }) {
    this.afAuth.auth.signInWithEmailAndPassword(login, password);
  }
}
