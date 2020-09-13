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
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../components/confirm-delete-dialog/confirm-delete-dialog.component';

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
    private afAuth: AngularFireAuth,
    private dialog: MatDialog
  ) {}

  async addWeight(weight: Weight) {
    const { uid } = await this.afAuth.currentUser;
    const id = this.afStore.createId();
    await this.collection.doc(id).set({
      value: weight.value,
      date: Timestamp.fromDate(weight.date),
      user: uid,
      id
    });
  }

  getWeights(): Observable<Weight[]> {
    return this.collection.valueChanges({ idField: 'id' }).pipe(
      map((values: DBWeight[]) => {
        return values.map<Weight>(v => ({
          value: v.value,
          date: v.date.toDate(),
          id: v.id
        }));
      })
    );
  }

  async deleteWeight(weight) {
    const dialog = this.dialog.open(ConfirmDeleteDialogComponent);
    try {
      const result = await dialog.afterClosed().toPromise();
      if (result) {
        return this.collection.doc(weight.id).delete();
      }
    } catch {}
  }
}
