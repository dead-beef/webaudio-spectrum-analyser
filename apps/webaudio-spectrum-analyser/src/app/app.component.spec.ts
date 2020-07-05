import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { AppComponent } from './app.component';
import { AlertComponent } from './components/alert/alert.component';
import { AudioGraphComponent } from './components/audio-graph/audio-graph.component';
import { CommonOptionsComponent } from './components/common-options/common-options.component';
import { FrequencyChartComponent } from './components/frequency-chart/frequency-chart.component';
import { WaveOptionsComponent } from './components/wave-options/wave-options.component';
import { UnitsPipe } from './pipes/units/units.pipe';
import { AudioGraphStoreModule } from './state/audio-graph/audio-graph.module';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClarityModule, NgxsModule.forRoot([]), AudioGraphStoreModule],
      declarations: [
        AppComponent,
        AudioGraphComponent,
        FrequencyChartComponent,
        AlertComponent,
        CommonOptionsComponent,
        WaveOptionsComponent,
        UnitsPipe,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.debugElement.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it("should have as title 'webaudio-spectrum-analyser'", () => {
    const adebugElComponent = fixture.debugElement.componentInstance;
    expect(adebugElComponent.title).toEqual('webaudio-spectrum-analyser');
  });

  it('should render title', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain(
      'Welcome to webaudio-spectrum-analyser!'
    );
  });
});
