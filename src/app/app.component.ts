import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  form: FormGroup = new FormGroup({
    date: new FormControl(new Date(), [Validators.required]),
    value: new FormControl(null, [Validators.required])
  });
}
