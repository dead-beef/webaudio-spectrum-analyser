import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioControlsComponent } from './audio-controls.component';

describe('AudioControlsComponent', () => {
  let component: AudioControlsComponent;
  let fixture: ComponentFixture<AudioControlsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      declarations: [AudioControlsComponent],
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
