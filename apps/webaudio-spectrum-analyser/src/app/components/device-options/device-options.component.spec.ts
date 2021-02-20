import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { getMockAudioGraph } from '../../utils/test.util';
import { AlertComponent } from '../alert/alert.component';
import { DeviceOptionsComponent } from './device-options.component';

describe('DeviceOptionsComponent', () => {
  let component: DeviceOptionsComponent;
  let fixture: ComponentFixture<DeviceOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        NgxsModule.forRoot([]),
        ClarityModule,
      ],
      declarations: [DeviceOptionsComponent, AlertComponent, ErrorPipe],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getMockAudioGraph,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
