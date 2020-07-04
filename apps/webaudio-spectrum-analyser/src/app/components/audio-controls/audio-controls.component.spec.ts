import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SafeUrlPipe } from '../../pipes/safe-url/safe-url.pipe';
import { AlertComponent } from '../alert/alert.component';
import { AudioControlsComponent } from './audio-controls.component';

describe('AudioControlsComponent', () => {
  let component: AudioControlsComponent;
  let fixture: ComponentFixture<AudioControlsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      declarations: [AudioControlsComponent, AlertComponent, SafeUrlPipe],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
