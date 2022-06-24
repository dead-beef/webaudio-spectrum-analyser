import { CommonModule, DOCUMENT } from '@angular/common';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { SimplebarAngularModule } from 'simplebar-angular';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { ROUTES } from './app.routes';
import { ErrorHandler as CustomErrorHandler } from './classes/error-handler/error-handler';
import { AlertComponent } from './components/alert/alert.component';
import { AnalyserFunctionChartComponent } from './components/analyser-function-chart/analyser-function-chart.component';
import { AnalyserFunctionValuesComponent } from './components/analyser-function-values/analyser-function-values.component';
import { AnalyserOptionsComponent } from './components/analyser-options/analyser-options.component';
import { AudioControlsComponent } from './components/audio-controls/audio-controls.component';
import { AudioGraphComponent } from './components/audio-graph/audio-graph.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { CepstrumChartComponent } from './components/cepstrum-chart/cepstrum-chart.component';
import { ChartComponent } from './components/chart/chart.component';
import { ChartsComponent } from './components/charts/charts.component';
import { CommonOptionsComponent } from './components/common-options/common-options.component';
import { DeviceOptionsComponent } from './components/device-options/device-options.component';
import { FileOptionsComponent } from './components/file-options/file-options.component';
import { FilterOptionsComponent } from './components/filter-options/filter-options.component';
import { FrequencyChartComponent } from './components/frequency-chart/frequency-chart.component';
import { GraphOptionsComponent } from './components/graph-options/graph-options.component';
import { InputFrequencyComponent } from './components/input-frequency/input-frequency.component';
import { InputRangeComponent } from './components/input-range/input-range.component';
import { SpectrogramComponent } from './components/spectrogram/spectrogram.component';
import { TimeDomainChartComponent } from './components/time-domain-chart/time-domain-chart.component';
import { UiOptionsComponent } from './components/ui-options/ui-options.component';
import { ValueComponent } from './components/value/value.component';
import { WaveOptionsComponent } from './components/wave-options/wave-options.component';
import { WorkletOptionsComponent } from './components/worklet-options/worklet-options.component';
import { InputFileUrlDirective } from './directives/input-file-url/input-file-url.directive';
import { StatsModule } from './modules/stats/stats.module';
import { ErrorPipe } from './pipes/error/error.pipe';
import { FrequencyUnitsPipe } from './pipes/frequency-units/frequency-units.pipe';
import { SafeUrlPipe } from './pipes/safe-url/safe-url.pipe';
import { TimePipe } from './pipes/time/time.pipe';
import { UnitsPipe } from './pipes/units/units.pipe';
import { AnalyserStoreModule } from './state/analyser/analyser.module';
import { AudioGraphStoreModule } from './state/audio-graph/audio-graph.module';
import { AudioGraphUiStoreModule } from './state/audio-graph-ui/audio-graph-ui.module';
import { APP_ENV, getDocument, getWindow, WINDOW } from './utils';

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
    InputFrequencyComponent,
    WorkletOptionsComponent,
    InputRangeComponent,
    GraphOptionsComponent,
    FilterOptionsComponent,
    AnalyserOptionsComponent,
    ChartsComponent,
    ChartComponent,
    TimeDomainChartComponent,
    CanvasComponent,
    SpectrogramComponent,
    CepstrumChartComponent,
    AnalyserFunctionValuesComponent,
    AnalyserFunctionChartComponent,
    FrequencyUnitsPipe,
    UiOptionsComponent,
    ValueComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClarityModule,
    SimplebarAngularModule,
    StatsModule,
    NgxsModule.forRoot([], { developmentMode: !environment.production }),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production,
      collapsed: true,
    }),
    NgxsStoragePluginModule.forRoot(),
    AudioGraphStoreModule,
    AudioGraphUiStoreModule,
    AnalyserStoreModule,
    RouterModule.forRoot(ROUTES, {
      useHash: true,
      relativeLinkResolution: 'legacy',
    }),
  ],
  providers: [
    UnitsPipe,
    { provide: ErrorHandler, useClass: CustomErrorHandler },
    { provide: WINDOW, useFactory: getWindow },
    { provide: DOCUMENT, useFactory: getDocument },
    { provide: APP_ENV, useValue: environment },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
