import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { getMockAudioGraph } from '../../utils/test.util';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { WaveOptionsComponent } from './wave-options.component';

describe('WaveOptionsComponent', () => {
  let component: WaveOptionsComponent;
  let fixture: ComponentFixture<WaveOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        FormsModule,
        ReactiveFormsModule,
        NgxsModule.forRoot([]),
      ],
      declarations: [InputFrequencyComponent, WaveOptionsComponent],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getMockAudioGraph,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(WaveOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
