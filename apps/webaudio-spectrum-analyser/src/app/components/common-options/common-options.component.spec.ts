import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { getAudioGraph } from '../../utils/factories';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { CommonOptionsComponent } from './common-options.component';

describe('CommonOptionsComponent', () => {
  let component: CommonOptionsComponent;
  let fixture: ComponentFixture<CommonOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        FormsModule,
        ReactiveFormsModule,
        NgxsModule.forRoot([]),
        AudioGraphStoreModule,
      ],
      declarations: [CommonOptionsComponent, UnitsPipe],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getAudioGraph,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CommonOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
