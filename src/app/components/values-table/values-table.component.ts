import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Weight } from '../../models';

@Component({
  selector: 'app-values-table',
  templateUrl: './values-table.component.html',
  styleUrls: ['./values-table.component.scss']
})
export class ValuesTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() values: Weight[] = [];
  displayedColumns = ['date', 'value', 'actions'];

  @Output() remove: EventEmitter<Weight> = new EventEmitter<Weight>();

  ngAfterViewInit() {}
}
