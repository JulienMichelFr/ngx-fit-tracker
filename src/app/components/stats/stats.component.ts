import { Component, Input, OnInit } from '@angular/core';
import { Stats } from '../../models';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  @Input() values: Stats;

  get loaded(): boolean {
    return !!this.values;
  }

  constructor() {}

  ngOnInit() {}
}
