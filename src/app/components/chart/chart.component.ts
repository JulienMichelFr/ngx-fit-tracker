import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Chart } from 'chart.js';
import { Weight } from '../../models';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @Input() data: Weight[] = [];

  private chart: Chart;
  @ViewChild('chart') chartElt: ElementRef;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart) {
      return;
    }
    if (changes && changes.data && changes.data.currentValue) {
      this.chart.data.labels = (this.data || []).map(({ date }) =>
        new Date(date).toLocaleDateString()
      );
      this.chart.data.datasets[0].data = (this.data || []).map(
        ({ value }) => value
      );
      this.chart.update();
    }
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartElt.nativeElement, {
      type: 'line',
      data: {
        labels: (this.data || []).map(({ date }) =>
          new Date(date).toLocaleDateString()
        ),
        datasets: [
          {
            label: 'Poids',
            data: (this.data || []).map(({ value }) => value),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 3
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                min: 110
              }
            }
          ]
        }
      }
    });
  }
}
