import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { SafeUrlPipe } from '../../pipes/safe-url/safe-url.pipe';
import { TimePipe } from '../../pipes/time/time.pipe';
import { mockComponent } from '../../utils/test.util';
import { AlertComponent } from '../alert/alert.component';
import { AudioControlsComponent } from './audio-controls.component';

describe('AudioControlsComponent', () => {
  let component: AudioControlsComponent;
  let fixture: ComponentFixture<AudioControlsComponent>;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: [BrowserModule, FormsModule, ReactiveFormsModule, ClarityModule],
      declarations: [
        AudioControlsComponent,
        AlertComponent,
        SafeUrlPipe,
        TimePipe,
        ErrorPipe,
        mockComponent('audio', {
          nativeElement: {
            play: () => null,
            pause: () => null,
          },
        }),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AudioControlsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
