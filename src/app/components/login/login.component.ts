import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Output() submit = new EventEmitter<{login: string, password: string}>();

  form = new FormGroup({
    login: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.minLength(6)])
  });

  constructor() {
  }

  ngOnInit() {
  }

  doLogin () {
    if (this.form.valid) {
      this.submit.emit(this.form.value);
    }
  }

}
