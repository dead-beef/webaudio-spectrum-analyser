import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';
import { SimplebarAngularModule } from 'simplebar-angular';

import { StatsModule } from './modules/stats/stats.module';

import { ROUTES } from './app.routes';

import { AppComponent } from './app.component';
import { UnitsPipe } from './pipes/units/units.pipe';
import { TimePipe } from './pipes/time/time.pipe';
import { ErrorPipe } from './pipes/error/error.pipe';
import { SafeUrlPipe } from './pipes/safe-url/safe-url.pipe';
import { InputFileUrlDirective } from './directives/input-file-url/input-file-url.directive';
import { AlertComponent } from './components/alert/alert.component';
import { AudioControlsComponent } from './components/audio-controls/audio-controls.component';
import { FrequencyChartComponent } from './components/frequency-chart/frequency-chart.component';
import { CommonOptionsComponent } from './components/common-options/common-options.component';
import { WaveOptionsComponent } from './components/wave-options/wave-options.component';
import { FileOptionsComponent } from './components/file-options/file-options.component';
import { DeviceOptionsComponent } from './components/device-options/device-options.component';
import { AudioGraphComponent } from './components/audio-graph/audio-graph.component';
import { InputFrequencyComponent } from './components/input-frequency/input-frequency.component';


@NgModule({
  declarations: [
    AppComponent,
    UnitsPipe,
    TimePipe,
    ErrorPipe,
    SafeUrlPipe,
    InputFileUrlDirective,
    AlertComponent,
    AudioControlsComponent,
    FrequencyChartComponent,
    CommonOptionsComponent,
    WaveOptionsComponent,
    FileOptionsComponent,
    DeviceOptionsComponent,
    AudioGraphComponent,
    InputFrequencyComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
		RouterModule.forRoot(ROUTES, {useHash: true}),
    ClarityModule,
    SimplebarAngularModule,
    StatsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
