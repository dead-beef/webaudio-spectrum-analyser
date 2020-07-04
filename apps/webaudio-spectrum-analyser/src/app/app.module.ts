import { CommonModule, DOCUMENT } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
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
import { FrequencyChartComponent } from './components/frequency-chart/frequency-chart.component';
import { InputFrequencyComponent } from './components/input-frequency/input-frequency.component';
import { WaveOptionsComponent } from './components/wave-options/wave-options.component';
import { InputFileUrlDirective } from './directives/input-file-url/input-file-url.directive';
import { StatsModule } from './modules/stats/stats.module';
import { ErrorPipe } from './pipes/error/error.pipe';
import { SafeUrlPipe } from './pipes/safe-url/safe-url.pipe';
import { TimePipe } from './pipes/time/time.pipe';
import { UnitsPipe } from './pipes/units/units.pipe';
import { AudioGraphStoreModule } from './state/audio-graph/audio-graph.module';
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
    NgxsRouterPluginModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    AudioGraphStoreModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
  ],
  providers: [
    { provide: WINDOW, useFactory: getWindow },
    { provide: DOCUMENT, useFactory: getDocument },
    { provide: APP_ENV, useValue: environment },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
