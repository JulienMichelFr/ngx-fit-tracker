import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DATE_LOCALE,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatInputModule,
  MatNativeDateModule, MatTabsModule, MatTableModule, MatPaginatorModule, MatSortModule
} from '@angular/material';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { LoginComponent } from './components/login/login.component';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { ChartComponent } from './components/chart/chart.component';
import { WeightFormComponent } from './components/weight-form/weight-form.component';
import { StatsComponent } from './components/stats/stats.component';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ValuesTableComponent } from './components/values-table/values-table.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, ChartComponent, WeightFormComponent, StatsComponent, ValuesTableComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    MatTabsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
