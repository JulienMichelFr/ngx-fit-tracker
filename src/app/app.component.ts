import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Chart } from 'chart.js';
import { data } from './data';
import { AngularFireAuth } from '@angular/fire/auth';
import { Stats, Weight } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private data: Weight[] = [...data];

  form: FormGroup = new FormGroup({
    date: new FormControl(new Date(), [Validators.required]),
    value: new FormControl(null, [Validators.required])
  });

  get last10() {
    return [...this.data].slice(Math.max([...this.data].length - 10, 1));
  }

  private get last10Avg() {
    return (
      Math.round(
        (this.last10.reduce((acc, value: any) => acc + value.value, 0) / 10) *
        100
      ) / 100
    );
  }

  private get last10Loss() {
    const [first] = this.last10;
    const [last] = this.last10.reverse();
    return Math.round((last.value - first.value) * 100) / 100;
  }

  get stats(): Stats {
    return {
      average: this.last10Avg,
      difference: this.last10Loss
    }
  }

  constructor(private afAuth: AngularFireAuth) {}


  addValue(weight: Weight) {
    this.data.push(weight);
  }

  signIn({ login, password }: { login: string, password: string }) {
    this.afAuth.auth.signInWithEmailAndPassword(login, password)
  }
}
