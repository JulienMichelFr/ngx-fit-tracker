import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Chart} from 'chart.js';
import {data} from './data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  private data = [...data];
  private chart: Chart;
  @ViewChild('chart') chartElt: ElementRef;

  get last10() {
    return [...this.data].slice(Math.max([...this.data].length - 10, 1));
  }

  get last10Avg() {
    return Math.round((this.last10.reduce((acc, value: any) => acc + value.value, 0) / 10) * 100) / 100 ;
  }

  get last10Loss() {
    const [first] = this.last10
    const [last] = this.last10.reverse()
    return Math.round((last.value - first.value) * 100) / 100;

  }

  form: FormGroup = new FormGroup({
    date: new FormControl(new Date(), [Validators.required]),
    value: new FormControl(null, [Validators.required])
  });

  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartElt.nativeElement, {
      type: 'line',
      data: {
        labels: this.last10.map((({date}) => new Date(date).toLocaleDateString())),
        datasets: [{
          label: 'Poids',
          data: this.last10.map((({value}) => value)),
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
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              min: 110
            }
          }]
        }
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const v = this.form.value;
      this.data.push(v);
      this.chart.data.labels = this.last10.map(({date}) => new Date(date).toLocaleDateString());
      this.chart.data.datasets[0].data = this.last10.map(({value}) => value);
      this.chart.update();
      this.form.reset({date: new Date(), value: 1});
    }
  }
}
