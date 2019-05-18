import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { Weight } from '../../models';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-values-table',
  templateUrl: './values-table.component.html',
  styleUrls: ['./values-table.component.scss']
})
export class ValuesTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() values: Weight[] = [];
  displayedColumns = ['date', 'value'];

  ngAfterViewInit() {
  }
}
