import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { SafeUrlPipe } from '../../pipes/safe-url/safe-url.pipe';
import { TimePipe } from '../../pipes/time/time.pipe';
import { getAudioGraph } from '../../utils/factories';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { mockComponent } from '../../utils/test.util';
import { AlertComponent } from '../alert/alert.component';
import { AudioControlsComponent } from '../audio-controls/audio-controls.component';
import { FileOptionsComponent } from './file-options.component';

describe('FileOptionsComponent', () => {
  let component: FileOptionsComponent;
  let fixture: ComponentFixture<FileOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        NgxsModule.forRoot([]),
        ClarityModule,
      ],
      declarations: [
        FileOptionsComponent,
        AlertComponent,
        SafeUrlPipe,
        TimePipe,
        ErrorPipe,
        AudioControlsComponent,
        mockComponent('audio', {
          nativeElement: {
            play: () => null,
            pause: () => null,
          },
        }),
      ],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getAudioGraph,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
