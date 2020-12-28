import { CommonModule, DOCUMENT } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { AlertComponent } from './components/alert/alert.component';
import { AudioControlsComponent } from './components/audio-controls/audio-controls.component';
import { AudioGraphComponent } from './components/audio-graph/audio-graph.component';
import { CommonOptionsComponent } from './components/common-options/common-options.component';
import { DeviceOptionsComponent } from './components/device-options/device-options.component';
import { FileOptionsComponent } from './components/file-options/file-options.component';
import { FilterOptionsComponent } from './components/filter-options/filter-options.component';
import { FrequencyChartComponent } from './components/frequency-chart/frequency-chart.component';
import { GraphOptionsComponent } from './components/graph-options/graph-options.component';
import { InputFrequencyComponent } from './components/input-frequency/input-frequency.component';
import { InputRangeComponent } from './components/input-range/input-range.component';
import { PitchOptionsComponent } from './components/pitch-options/pitch-options.component';
import { WaveOptionsComponent } from './components/wave-options/wave-options.component';
import { WorkletOptionsComponent } from './components/worklet-options/worklet-options.component';
import { InputFileUrlDirective } from './directives/input-file-url/input-file-url.directive';
import { StatsModule } from './modules/stats/stats.module';
import { ErrorPipe } from './pipes/error/error.pipe';
import { SafeUrlPipe } from './pipes/safe-url/safe-url.pipe';
import { TimePipe } from './pipes/time/time.pipe';
import { UnitsPipe } from './pipes/units/units.pipe';
import { AudioGraphStoreModule } from './state/audio-graph/audio-graph.module';
import { getAudioGraph, getDocument, getWindow } from './utils/factories';
import { APP_ENV, AUDIO_GRAPH, WINDOW } from './utils/injection-tokens';

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
    PitchOptionsComponent,
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
    NgxsStoragePluginModule.forRoot({
      beforeSerialize: (obj: Record<string, any>, key: string) => {
        //console.log('beforeSerialize', key, obj);
        if (Object.prototype.hasOwnProperty.call(obj, 'AudioGraph')) {
          return {
            ...obj,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            AudioGraph: {
              ...obj.AudioGraph,
              paused: true,
              suspended: true,
            },
          };
        }
        return obj;
      },
    }),
    AudioGraphStoreModule,
    RouterModule.forRoot(ROUTES, {
      useHash: true,
      relativeLinkResolution: 'legacy',
    }),
  ],
  providers: [
    { provide: WINDOW, useFactory: getWindow },
    { provide: DOCUMENT, useFactory: getDocument },
    { provide: APP_ENV, useValue: environment },
    { provide: AUDIO_GRAPH, useFactory: getAudioGraph },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
