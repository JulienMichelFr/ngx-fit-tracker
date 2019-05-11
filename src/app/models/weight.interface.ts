import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

export interface Weight {
  date: Date;
  value: number;
}

export interface DBWeight {
  uid: string;
  date: Timestamp;
  value: number;
}
