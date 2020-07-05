import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';

import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { WaveOptionsComponent } from './wave-options.component';

describe('WaveOptionsComponent', () => {
  let component: WaveOptionsComponent;
  let fixture: ComponentFixture<WaveOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [ClarityModule, FormsModule, ReactiveFormsModule],
      declarations: [InputFrequencyComponent, WaveOptionsComponent],
      providers: [
        {
          provide: AudioGraphService,
          useValue: {
            graph: {
              nodes: {
                wave: {
                  frequency: {
                    type: 'sine',
                    value: 440,
                  },
                },
              },
            },
            setSourceNode: (...args) => null,
          },
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
