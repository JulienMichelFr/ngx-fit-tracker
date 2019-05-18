import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { distinctUntilChanged, filter, skipWhile } from 'rxjs/operators';

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.scss']
})
export class DateRangePickerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() start: Date;
  @Input() end: Date;

  @Output() rangeChange = new EventEmitter<{ start: Date, end: Date }>();

  form: FormGroup;
  maxDate = new Date();

  private sink = new SubSink();

  constructor() {
    this.form = new FormGroup({
      start: new FormControl(this.start, [Validators.required]),
      end: new FormControl(this.end, [Validators.required])
    });
  }

  ngOnInit() {
    this.sink.add(
      this.form.valueChanges.pipe(
        skipWhile(() => this.form.invalid),
        distinctUntilChanged()
      ).subscribe((value) => {
        this.rangeChange.emit(value);
      })
    );
  }

  ngOnDestroy(): void {
    this.sink.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.start && changes.start.currentValue) {
      this.form.patchValue({start: changes.start.currentValue}, {emitEvent: false});
    }
    if (changes.end && changes.end.currentValue) {
      this.form.patchValue({end: changes.end.currentValue}, {emitEvent: false});
    }
  }

}
