import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { DBWeight, Weight } from '../../models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class WeightService {
  private collection: AngularFirestoreCollection<
    DBWeight
  > = this.afStore.collection<DBWeight>('weight', ref => {
    return ref
      .orderBy('date')
      .where('user', '==', firebase.auth().currentUser.uid);
  });

  constructor(
    private afStore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {}

  async addWeight(weight: Weight) {
    const { uid } = await this.afAuth.currentUser;
    await this.collection.add({
      value: weight.value,
      date: Timestamp.fromDate(weight.date),
      user: uid
    });
  }

  getWeights(): Observable<Weight[]> {
    return this.collection.valueChanges().pipe(
      map((values: DBWeight[]) => {
        return values.map<Weight>(v => ({
          value: v.value,
          date: v.date.toDate()
        }));
      })
    );
  }
}
