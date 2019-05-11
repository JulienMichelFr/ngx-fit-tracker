import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Weight } from '../../models';

@Component({
  selector: 'app-weight-form',
  templateUrl: './weight-form.component.html',
  styleUrls: ['./weight-form.component.scss']
})
export class WeightFormComponent implements OnInit {
  @Output() submit = new EventEmitter<Weight>();

  public form = new FormGroup({
    date: new FormControl(new Date(), [Validators.required]),
    value: new FormControl(null, Validators.required)
  });

  constructor() {}

  ngOnInit() {}

  doSubmit() {
    if (this.form.valid) {
      this.submit.emit(this.form.value);
      this.form.reset();
    }
  }
}
