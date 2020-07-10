import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { getAudioGraph } from '../../utils/factories';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { AlertComponent } from '../alert/alert.component';
import { WorkletOptionsComponent } from './worklet-options.component';

describe('WorkletOptionsComponent', () => {
  let component: WorkletOptionsComponent;
  let fixture: ComponentFixture<WorkletOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        FormsModule,
        ReactiveFormsModule,
        NgxsModule.forRoot([]),
      ],
      declarations: [WorkletOptionsComponent, AlertComponent],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getAudioGraph,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkletOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
